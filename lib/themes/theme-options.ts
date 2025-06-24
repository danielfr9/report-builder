type ThemeOption = {
  name: string;
  value: string;
};

// NOTE: The value must not contain a whitespace character
export const themeOptions: ThemeOption[] = [
  {
    name: "Light",
    value: "light",
  },
  {
    name: "Dark",
    value: "dark",
  },
  {
    name: "Caffeine",
    value: "caffeine",
  },
  {
    name: "Caffeine Dark",
    value: "caffeine-dark",
  },
  {
    name: "Tangenrine",
    value: "tangenrine",
  },
  {
    name: "Tangenrine Dark",
    value: "tangenrine-dark",
  },
  {
    name: "Twitter",
    value: "twitter",
  },
  {
    name: "Twitter Dark",
    value: "twitter-dark",
  },
  {
    name: "Supabase",
    value: "supabase",
  },
  {
    name: "Supabase Dark",
    value: "supabase-dark",
  },
  {
    name: "Ayu",
    value: "ayu",
  },
  {
    name: "Ayu Dark",
    value: "ayu-dark",
  },
  {
    name: "One Dark",
    value: "one-dark",
  },
  {
    name: "Dracula",
    value: "dracula",
  },
];
