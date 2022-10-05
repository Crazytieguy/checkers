const isDark = () => document.documentElement.classList.contains("dark");

const toggleDark = () => {
  if (isDark()) {
    localStorage.theme = "light";
    document.documentElement.classList.remove("dark");
  } else {
    localStorage.theme = "dark";
    document.documentElement.classList.add("dark");
  }
};

export default function ThemeToggle() {
  return (
    <input id="toggle" class="toggle" type="checkbox" onChange={toggleDark} />
  );
}
