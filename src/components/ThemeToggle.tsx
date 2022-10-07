const isDark = () => document.documentElement.classList.contains("dark");

const toggleDark = () => {
  localStorage.theme = isDark() ? "light" : "dark";
  document.documentElement.classList.toggle("dark");
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
