export type LocalPlayer = {
  key: string;
  name: string;
  avatarColor: string;
};

const colors = ["slate", "zinc", "stone", "red", "blue", "green", "amber"];

export function getLocalPlayer(): LocalPlayer {
  if (typeof window === "undefined") {
    return { key: "server", name: "Player", avatarColor: "slate" };
  }

  const keyName = "uwmp.playerKey";
  const nameName = "uwmp.playerName";
  const colorName = "uwmp.avatarColor";
  let key = window.localStorage.getItem(keyName);
  let name = window.localStorage.getItem(nameName);
  let avatarColor = window.localStorage.getItem(colorName);

  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(keyName, key);
  }

  if (!name) {
    name = `Player ${key.slice(0, 4).toUpperCase()}`;
    window.localStorage.setItem(nameName, name);
  }

  if (!avatarColor) {
    avatarColor = colors[Math.abs(hashCode(key)) % colors.length];
    window.localStorage.setItem(colorName, avatarColor);
  }

  return { key, name, avatarColor };
}

export function saveLocalPlayerName(name: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("uwmp.playerName", name.trim().slice(0, 32));
}

function hashCode(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}
