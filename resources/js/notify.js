import {$notify} from "./$$DOM";

export default function notify(type, message) {
  let $container = document.createElement("div");
  let $time = document.createElement("time");
  let time = (new Date()).toLocaleTimeString();
  $time.textContent = `[${time}] `;
  $container.insertAdjacentElement("beforeEnd", $time);

  let $symbol = document.createElement("b");
  let $message = document.createElement("span");
  if (type === 0) { // 0 = error
    $symbol.textContent = "Error: ";
  } else if (type === 1) { // 1 = warning
    $symbol.textContent = "Warn: ";
  } else { // ? = info
    $symbol.textContent = "Info: ";
  }
  $container.insertAdjacentElement("beforeEnd", $symbol);
  $message.textContent = message;
  $container.insertAdjacentElement("beforeEnd", $message);
  $notify.insertAdjacentElement("afterBegin", $container);
}
