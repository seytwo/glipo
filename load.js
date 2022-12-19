function createCanvas(basis)
{
  const canvas = document.createElement("canvas");
  canvas.style.border = "1px dashed"
  canvas.width = basis.size;
  canvas.height = basis.size;
  return canvas;
}

const polyhedron = [];

function load()
{
  const basis = new Basis();

  const canvasVector = createCanvas(basis);
  document.body.appendChild(canvasVector);

  const canvasPolyhedron = createCanvas(basis);
  document.body.appendChild(canvasPolyhedron);

  document.body.appendChild(document.createElement("br"));

  const tableDiv = document.createElement("div");
  tableDiv.style.overflow = "scroll";
  tableDiv.style.height = 200;
  document.body.appendChild(tableDiv);
  const table = document.createElement("table");
  tableDiv.appendChild(table);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  const renderer = new Renderer(polyhedron, basis, canvasVector, canvasPolyhedron, tbody);
  renderer.draw();

  const elch = new EventListenerCreateHalfspace(polyhedron, basis, canvasVector, renderer);
  const elsh = new EventListenerSelectHalfspace(polyhedron, basis, canvasVector, renderer);
  const eluhv = new EventListenerUpdateHalfspaceVector(polyhedron, basis, canvasVector, renderer, elsh);
  const eluhs = new EventListenerUpdateHalfspaceScalar(polyhedron, basis, canvasVector, renderer, elsh);
  const elus = new EventListenerUpdateScale(polyhedron, basis, canvasVector, renderer, elsh);
  const elub = new EventListenerUpdateBasis(polyhedron, basis, canvasVector, renderer, elsh);
  const eluc = new EventListenerUpdateColor(renderer, elsh);

  // elch.addHalfspace(new Vector([0.5,0.5,0]));
  // elch.addHalfspace(new Vector([0.5,0,0.5]));
  // elch.addHalfspace(new Vector([0,0.5,0.5]));
  // renderer.draw();

  return;
}