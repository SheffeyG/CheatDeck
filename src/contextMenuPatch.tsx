import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findModuleChild,
  MenuItem,
  Navigation,
  Patch,
} from 'decky-frontend-lib';


// Always add before "Properties..."
const spliceArtworkItem = (children: any[], appid: number) => {
  children.find((x: any) => x?.key === 'properties');
  const propertiesMenuItemIdx = children.findIndex((item) =>
    findInReactTree(item, (x) => x?.onSelected && x.onSelected.toString().includes('AppProperties'))
  );
  children.splice(propertiesMenuItemIdx, 0, (
    <MenuItem
      key="cheat-deck"
      onSelected={() => {
        Navigation.Navigate(`/cheat-settings/${appid}`);
      }}
    >
      Cheat
    </MenuItem>
  ));
};

/**
 * Patches the game context menu.
 * @param LibraryContextMenu The game context menu.
 * @returns A patch to remove when the plugin dismounts.
 */
const contextMenuPatch = (LibraryContextMenu: any) => {
  const patches: {
    outer?: Patch,
    inner?: Patch,
    unpatch: () => void;
  } = { unpatch: () => {return null;} };
  patches.outer = afterPatch(LibraryContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
    const appid: number = component._owner.pendingProps.overview.appid;

    if (!patches.inner) {
      patches.inner = afterPatch(component.type.prototype, 'shouldComponentUpdate', ([nextProps]: any, shouldUpdate: any) => {
        const sgdbIdx = nextProps.children.findIndex((x: any) => x?.key === 'cheat-deck');
        if (sgdbIdx != -1) nextProps.children.splice(sgdbIdx, 1);

        if (shouldUpdate === true) {
          let updatedAppid: number = appid;
          // find the first menu component that has the correct appid assigned to _owner
          const parentOverview = nextProps.children.find((x: any) => x?._owner?.pendingProps?.overview?.appid &&
            x._owner.pendingProps.overview.appid !== appid
          );
          // if found then use that appid
          if (parentOverview) {
            updatedAppid = parentOverview._owner.pendingProps.overview.appid;
          }
          spliceArtworkItem(nextProps.children, updatedAppid);
        }

        return shouldUpdate;
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

/**
 * Game context menu component.
 */
export const LibraryContextMenu = fakeRenderComponent(
  findModuleChild((m) => {
    if (typeof m !== 'object') return;
    for (const prop in m) {
      if (
        m[prop]?.toString() &&
        m[prop].toString().includes('().LibraryContextMenu')
      ) {
        return Object.values(m).find((sibling) => (
          sibling?.toString().includes('createElement') &&
          sibling?.toString().includes('navigator:')
        ));
      }
    }
    return;
  })
).type;

export default contextMenuPatch;