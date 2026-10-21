/**
 * Credit: decky-steamgriddb
 * https://github.com/SteamGridDB/decky-steamgriddb/blob/main/src/patches/contextMenuPatch.tsx
 */

import {
  afterPatch,
  type Export,
  fakeRenderComponent,
  findInReactTree,
  findInTree,
  findModuleByExport,
  MenuItem,
  Navigation,
  type Patch,
} from "@decky/ui";
import type { FC } from "react";

import { logger } from "./utils/logger";

// Always add before "Properties..."
const spliceArtworkItem = (children: any[], appid: number) => {
  children.find((x: any) => x?.key === "properties");
  const propertiesMenuItemIdx = children.findIndex((item) =>
    findInReactTree(item, (x) => x?.onSelected?.toString().includes("AppProperties")),
  );
  children.splice(
    propertiesMenuItemIdx,
    0,
    <MenuItem
      key="cheat-deck"
      onSelected={() => {
        Navigation.Navigate(`/cheatdeck/${appid}`);
      }}
    >
      CheatDeck
    </MenuItem>,
  );
};

// Check if correct menu by looking at the code of the onSelected function
// Should be enough to ignore the screenshots and other menus.
const isOpeningAppContextMenu = (items: any[]) => {
  if (!items?.length) {
    return false;
  }
  return !!findInReactTree(items, (x) => x?.props?.onSelected?.toString().includes("launchSource"));
};

const handleItemDupes = (items: any[]) => {
  const sgdbIdx = items.findIndex((x: any) => x?.key === "cheat-deck");
  if (sgdbIdx !== -1) items.splice(sgdbIdx, 1);
};

const patchMenuItems = (menuItems: any[], appid: number) => {
  let updatedAppid: number = appid;
  // find the first menu component that has the correct appid, sometimes the one passed is cached from another context menu
  const parentOverview = menuItems.find(
    (x: any) => x?._owner?.pendingProps?.overview?.appid && x._owner.pendingProps.overview.appid !== appid,
  );
  // if found then use that appid
  if (parentOverview) {
    updatedAppid = parentOverview._owner.pendingProps.overview.appid;
  }
  // Oct 2025 client
  if (updatedAppid === appid) {
    const foundApp = findInTree(menuItems, (x) => x?.app?.appid, { walkable: ["props", "children"] });
    if (foundApp) {
      updatedAppid = foundApp.app.appid;
    }
  }
  spliceArtworkItem(menuItems, updatedAppid);
};

/**
 * Patches the game context menu.
 * @param LibraryContextMenu The game context menu.
 * @returns A patch to remove when the plugin dismounts.
 */
const contextMenuPatch = (LibraryContextMenu: any) => {
  const patches: {
    outer?: Patch;
    inner?: Patch;
    unpatch: () => void;
  } = {
    unpatch: () => {
      return null;
    },
  };

  // Steam ships renamed/refactored internals regularly. When the lookup fails we
  // skip the context menu entry instead of crashing the whole plugin at import
  // time (TypeError: fun is not a function, see issue #75).
  if (typeof LibraryContextMenu !== "function" || typeof LibraryContextMenu.prototype?.render !== "function") {
    logger.warning("CheatDeck context menu entry disabled: LibraryContextMenu is unavailable");
    return patches;
  }

  patches.outer = afterPatch(LibraryContextMenu.prototype, "render", (_: Record<string, unknown>[], component: any) => {
    let appid: number = 1018880;
    if (component._owner) {
      appid = component._owner.pendingProps.overview.appid;
    } else {
      // Oct 2025 client
      const foundApp = findInTree(component.props.children, (x) => x?.app?.appid, { walkable: ["props", "children"] });
      if (foundApp) {
        appid = foundApp.app.appid;
      }
    }

    if (!patches.inner) {
      patches.inner = afterPatch(component, "type", (_: any, ret: any) => {
        // initial render
        afterPatch(ret.type.prototype, "render", (_: any, ret2: any) => {
          const menuItems = ret2.props.children[0]; // always the first child
          if (!isOpeningAppContextMenu(menuItems)) return ret2;
          try {
            handleItemDupes(menuItems);
          } catch (error) {
            return ret2;
          }
          patchMenuItems(menuItems, appid);
          return ret2;
        });

        // when steam decides to regresh app overview
        afterPatch(ret.type.prototype, "shouldComponentUpdate", ([nextProps]: any, shouldUpdate: any) => {
          try {
            handleItemDupes(nextProps.children);
          } catch (error) {
            // wrong context menu (probably)
            return shouldUpdate;
          }

          if (shouldUpdate === true) {
            patchMenuItems(nextProps.children, appid);
          }

          return shouldUpdate;
        });
        return ret;
      });
    } else {
      spliceArtworkItem(component.props.children, appid);
    }
    return component;
  });
  patches.unpatch = () => {
    patches.outer?.unpatch();
    patches.inner?.unpatch();
  };
  return patches;
};

const isComponent = (value: unknown): value is FC => typeof value === "function";

/**
 * Resolves the game context menu component from Steam's webpack modules.
 *
 * Both `findModuleByExport` and the export lookup itself are best-effort: a
 * Steam client update can change the module shape at any time. Passing
 * `undefined` into `fakeRenderComponent` throws `TypeError: fun is not a
 * function` during module evaluation, which used to prevent the entire plugin
 * from loading (issue #75). Resolve defensively and let the caller degrade to
 * "no context menu entry" instead.
 */
export const resolveLibraryContextMenu = (): FC | undefined => {
  try {
    const module = findModuleByExport((e: Export) => e?.toString?.().includes("().LibraryContextMenu"));
    const candidate = module
      ? Object.values(module).find((sibling) => sibling?.toString?.().includes("navigator:"))
      : undefined;
    if (!isComponent(candidate)) {
      logger.warning("LibraryContextMenu could not be resolved; context menu entry is disabled");
      return undefined;
    }
    // fakeRenderComponent() can return null when the stub render fails, so the
    // rendered type has to be validated before it is used as a component.
    const rendered = fakeRenderComponent(candidate);
    if (!isComponent(rendered?.type)) {
      logger.warning("LibraryContextMenu rendered without a component type; entry is disabled");
      return undefined;
    }
    return rendered.type;
  } catch (error) {
    logger.error("Failed to resolve LibraryContextMenu", error);
    return undefined;
  }
};

/**
 * Game context menu component, or `undefined` when the Steam client layout is
 * not supported yet.
 */
export const LibraryContextMenu = resolveLibraryContextMenu();

export default contextMenuPatch;
