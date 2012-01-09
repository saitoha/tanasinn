
/** 
 * @class Launcher
 */
let Launcher = new Class().extends(Component).mix(EventBroker);
Launcher.definition = {

  get id()
    "launcher",

  top: 20,
  left: 20,

  initializeWithWindow: 
  function initializeWithWindow(window)
  {
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "event/new-window-detected",
    function onNewWindow(window) 
    {
      new Launcher(process)
        .initializeWithWindow(window);
    });
}


