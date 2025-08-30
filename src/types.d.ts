type OptionPosition = "before" | "after";

type OptionType = "env" | "pre_cmd" | "flag_args";

interface LaunchOption {
  type: OptionType;
  key: string;
  value?: string;
}

interface CustomOption extends LaunchOption {
  id: string;
  label: string;
}
