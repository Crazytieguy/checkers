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
    <button
      class="theme-toggle"
      title="Togles dark theme"
      onClick={toggleDark}
    />
  );
}
