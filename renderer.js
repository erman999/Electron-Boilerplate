console.log(NodeElectron.myFunction());
console.log(NodeElectron.myParameter('Hello'));
console.log(NodeElectron.myLib());

// Get button element
const btn = document.getElementById('btn');

// Listen for click event
btn.addEventListener('click', async () => {
  // Call our 'nodeTest' method which we defined in 'preload.js'
  const result = await window.NodeElectron.nodeTest();
  // Show Node.js result in console
  console.log(result);
});
