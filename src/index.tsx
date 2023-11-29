import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Dropdown,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
  ToggleField,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaWrench } from "react-icons/fa";

const [settings] = useState<Settings>(new Settings(serverAPI))

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {

  return (
    <PanelSection title="Setting">
      <PanelSectionRow>
        <ToggleField
          label="Enable plugin"
          description="Enable to activate plugin."
          checked={false}
          onChange={() => {
          }}
        >
        </ToggleField>
      </PanelSectionRow>

      <PanelSectionRow>
        <Dropdown
          strDefaultLabel="Select App..."
          rgOptions={dropdownOptions}
          selectedOption={selectedLang}
          onChange={(e: SingleDropdownOption) => {
            setIsStarred(e.data < settings.get("starredApps").length);
            setSelectedApp(e.data);
          }}
        />

      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ margin: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
        Go to Library
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaWrench />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
