const SIZE = 300;
function createCanvas()
{
  const canvas = document.createElement("canvas");
  canvas.style.border = "1px dashed"
  canvas.width = SIZE;
  canvas.height = SIZE;
  return canvas;
}

const canvasVector = createCanvas();
const canvasPolyhedron = createCanvas();
const table = document.createElement("table");
const tbody = document.createElement("tbody");
table.appendChild(tbody);

function load()
{
  // 
  document.body.appendChild(canvasVector);
  document.body.appendChild(canvasPolyhedron);
  document.body.appendChild(document.createElement("br"));
  document.body.appendChild(table);

  // イベントを追加
  canvasVector.addEventListener("mousedown", mousedown);
  canvasVector.addEventListener("mousemove", mousemove);
  canvasVector.addEventListener("mouseup", mouseup);
  window.addEventListener("mousewheel", mousewheel);

  // 初期描画
  draw();

  return;
}

function draw()
{
  draw0();
  draw1();
}
function clear(canvas)
{
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  return;
}

function draw0()
{
  // キャンバスを取得
  const canvas = canvasVector;

  // クリア
  clear(canvas);

  // 円を追加
  drawCircle(canvas);

  // 選択した超平面のベクトル
  if (hyperplane_selected != null)
  {
    drawVector(canvas, hyperplane_selected.vector, "", "red", 7);
  }

  // ベクトル
  for (let i = 0; i < hyperplanes.length; i++)
  {
    const hyperplane = hyperplanes[i];
    drawVector(canvas, hyperplane.vector, i);
  }

  return
}
function drawCircle(canvas)
{
  const context = canvas.getContext("2d");

  context.beginPath();
  context.arc(SIZE/2, SIZE/2, SIZE/2, 0, 2*Math.PI);

  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.globalAlpha = 1;
  context.stroke();

  context.fillStyle = "blue";
  context.globalAlpha = 0.5;
  context.fill();

  return;
}
RADIUS = 5;
function drawVector(canvas, vector, name, color="black", size=RADIUS)
{
  const context = canvas.getContext("2d");

  vector = xyzToCanvas(vector);

  context.beginPath();
  context.arc(vector[0], vector[1], size, 0, 2*Math.PI);

  context.strokeStyle = color;
  context.lineWidth = 1;
  context.globalAlpha = 1;
  context.stroke();

  context.fillStyle = color;
  context.globalAlpha = (vector[2] >= 0) ? 1 : 0.3;
  context.fill();

  context.fillText(name, vector[0]+size, vector[1]+size);

  return;
}

const LIM = 1;
function draw1()
{
  // キャンバスを取得
  const canvas = canvasPolyhedron;
  const context = canvas.getContext("2d");

  // クリア
  clear(canvas);

  // 頂点を取得
  const points = enumeratePoints();

  // ファセットを取得
  for (const hyperplane of hyperplanes)
  {
    hyperplane.facet = getFacet(hyperplane, points);
  }

  // ファセットを描画
  for (const hyperplane of hyperplanes)
  {
    const facet = hyperplane.facet;
    if (facet.length == 0)
    {
      continue;
    }
    drawFacet(canvas, facet);
  }

  // ファセットの中心を計算
  for (let i = 0; i < hyperplanes.length; i++)
  {
    const facet = hyperplanes[i].facet;
    const centor = getCentor(facet);
    drawCentor(canvas, centor, i);
  }

  //
  if (hyperplane_selected != null)
  {
    const facet = hyperplane_selected.facet;
    if (facet.length != 0)
    {
      drawFacet(canvas, facet, "blue", 0.4);
    }
  }

  return;
}
function getFacet(hyperplane, points)
{
  const facet = [];

  for (const point of points)
  {
    const r = hyperplane.vector.inner(point) - hyperplane.scalar;
    if (Math.round(r*100000)/100000 == 0)
    {
      facet.push(point);
    }
  }

  if (facet.length == 0)
  {
    return facet;
  }

  // ファセットの中心を計算
  let centor = new Vector([0,0,0]);
  for (const point of facet)
  {
    centor = centor.vadd(point);
  }
  centor = centor.sdiv(facet.length);

  facet.sort((point1, point2)=>{
    const diff1 = point1.vsub(centor);
    const diff2 = point2.vsub(centor);
    const degree1 = Math.atan2(diff1[1], diff1[0])
    const degree2 = Math.atan2(diff2[1], diff2[0])
    return degree1-degree2;
  });

  return facet;
}
function getCentor(facet)
{
  let centor = new Vector([0,0,0]);
  for (const point of facet)
  {
    centor = centor.vadd(point);
  }
  centor = centor.sdiv(facet.length);
  return centor;
}
function drawFacet(canvas, facet, color="blue", alpha=0.1)
{
  const context = canvas.getContext("2d");

  context.beginPath();
  context.moveTo((facet[0][0]+LIM)*SIZE/(2*LIM), (LIM-facet[0][1])*SIZE/(2*LIM));
  for (const point of facet.slice(1))
  {
    context.lineTo((point[0]+LIM)*SIZE/(2*LIM), (LIM-point[1])*SIZE/(2*LIM));
  }
  context.closePath();

  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.fill();

  context.strokeStyle = "black";
  context.globalAlpha = 1;
  context.stroke();

  return;
}
function drawCentor(canvas, centor, i)
{
  const context = canvas.getContext("2d");

  context.fillStyle = "black";
  context.globalAlpha = 1;
  context.fillText(i, (centor[0]+LIM)*SIZE/(2*LIM), (LIM-centor[1])*SIZE/(2*LIM));

  return;
}

let hyperplane_selected = null;
let isMouseDown = false;
const hyperplanes = [];
function mousedown(event)
{
  // ベクトルを選択
  hyperplane_selected = selectHyperplane(event);

  isMouseDown = true;

  draw();

  return;
}
function selectHyperplane(event)
{
  const cursor = getCursor(event);
  for (let hyperplane of hyperplanes)
  {
    const vector = xyzToCanvas(hyperplane.vector);
    const distance = cursor.distance(vector);
    if (distance <= RADIUS)
    {
      return hyperplane;
    }
  }
  return;
}

function mousemove(event)
{
  // カーソルを取得
  const cursor = canvasToXYZ(getCursor(event));

  // 円外の場合は円周に射影
  if (isNaN(cursor[2]))
  {
    cursor[2] = 0;
    cursor.move(cursor.sdiv(cursor.norm()));
  }

  // ベクトルを移動
  if (isMouseDown && (hyperplane_selected != null))
  {
    update_vector(cursor);
    update_eq_vector(hyperplane_selected);
    draw();
  }

  return;
}

function mouseup(event)
{
  // 
  if (hyperplane_selected == null)
  {
    click(event);
  }

  isMouseDown = false;

  draw();

  return;
}
function click(event)
{
  // カーソルを取得
  const cursor = canvasToXYZ(getCursor(event));

  if (isNaN(cursor[2]))
  {
    return;
  }

  const tr = document.createElement("tr");
  const td_idx = document.createElement("td");
  const td_p1 = document.createElement("td");
  const td_a1 = document.createElement("td");
  const td_x1 = document.createElement("td");
  const td_p2 = document.createElement("td");
  const td_a2 = document.createElement("td");
  const td_x2 = document.createElement("td");
  const td_p3 = document.createElement("td");
  const td_a3 = document.createElement("td");
  const td_x3 = document.createElement("td");
  const td_leq = document.createElement("td");
  const td_b = document.createElement("td");
  const tn_idx = document.createTextNode("["+String(hyperplanes.length)+"]");
  const tn_p1 = document.createTextNode(null);
  const tn_a1 = document.createTextNode(null);
  const tn_x1 = document.createTextNode("x");
  const tn_p2 = document.createTextNode(null);
  const tn_a2 = document.createTextNode(null);
  const tn_x2 = document.createTextNode("y");
  const tn_p3 = document.createTextNode(null);
  const tn_a3 = document.createTextNode(null);
  const tn_x3 = document.createTextNode("z");
  const tn_leq = document.createTextNode("<=");
  const tn_b = document.createTextNode(null)

  tbody.appendChild(tr);
  tr.appendChild(td_idx);
  tr.appendChild(td_p1);
  tr.appendChild(td_a1);
  tr.appendChild(td_x1);
  tr.appendChild(td_p2);
  tr.appendChild(td_a2);
  tr.appendChild(td_x2);
  tr.appendChild(td_p3);
  tr.appendChild(td_a3);
  tr.appendChild(td_x3);
  tr.appendChild(td_leq);
  tr.appendChild(td_b);  
  td_idx.appendChild(tn_idx);
  td_p1.appendChild(tn_p1);
  td_a1.appendChild(tn_a1);
  td_x1.appendChild(tn_x1);
  td_p2.appendChild(tn_p2);
  td_a2.appendChild(tn_a2);
  td_x2.appendChild(tn_x2);
  td_p3.appendChild(tn_p3);
  td_a3.appendChild(tn_a3);
  td_x3.appendChild(tn_x3);
  td_leq.appendChild(tn_leq);
  td_b.appendChild(tn_b);

  td_a1.style.textAlign = "right";
  td_p2.style.textAlign = "center";
  td_a2.style.textAlign = "right";
  td_p3.style.textAlign = "center";
  td_a3.style.textAlign = "right";
  td_b.style.textAlign = "right";

  const hyperplane = new Hyperplane(cursor.copy(), 0, tn_p1, tn_a1, tn_p2, tn_a2, tn_p3, tn_a3, tn_b);
  hyperplanes.push(hyperplane);

  update_eq_vector(hyperplane);
  update_eq_scalar(hyperplane);

  return;
}

function mousewheel(event)
{
  if (hyperplane_selected != null)
  {
    update_scalar(event, hyperplane_selected);
    update_eq_scalar(hyperplane_selected);
    draw();
  }

  return;
}

function update_vector(cursor)
{
  hyperplane_selected.vector.move(cursor);
  return;
}
function update_scalar(event, hyperplane)
{
  hyperplane.scalar += (event.deltaY < 0) ? +0.01 : -0.01;
  hyperplane.scalar = Math.max(hyperplane.scalar, 0);
  return
}

function getCursor(event)
{
  return new Vector([ 
    event.offsetX,
    event.offsetY,
    0
  ]);
}
function canvasToXYZ(cursor)
{
  cursor = new Vector([ 
    2*cursor[0]/SIZE-1,
    1-2*cursor[1]/SIZE,
    0
  ]);
  cursor[2] = Math.sqrt(1-cursor[0]**2-cursor[1]**2);
  return cursor;
}
function xyzToCanvas(cursor)
{
  return new Vector([
    SIZE/2+cursor[0]*SIZE/2,
    SIZE/2-cursor[1]*SIZE/2,
    cursor[2]
  ]);
}

function update_eq_vector(hyperplane)
{
  hyperplane.tn_p1.data = (hyperplane.vector[0] >= 0) ? ("") : ("-");
  hyperplane.tn_a1.data = Math.round(Math.abs(hyperplane.vector[0])*100)/100;
  hyperplane.tn_p2.data = (hyperplane.vector[1] >= 0) ? ("+") : ("-");
  hyperplane.tn_a2.data = Math.round(Math.abs(hyperplane.vector[1])*100)/100;
  hyperplane.tn_p3.data = (hyperplane.vector[2] >= 0) ? ("+") : ("-");
  hyperplane.tn_a3.data = Math.round(Math.abs(hyperplane.vector[2])*100)/100;
  return;
}
function update_eq_scalar(hyperplane)
{
  hyperplane.tn_b.data = Math.round(hyperplane.scalar*100)/100;
  return;
}


function enumeratePoints()
{
  // 超平面（枠を含む）
  const hyperplanes_ = [
    new Hyperplane(new Vector([+1,0,0]), LIM),
    new Hyperplane(new Vector([-1,0,0]), LIM),
    new Hyperplane(new Vector([0,+1,0]), LIM),
    new Hyperplane(new Vector([0,-1,0]), LIM),
  ].concat(hyperplanes);

  // すべての超平面の組合せに対して
  const points = [];
  for (let i = 0; i < hyperplanes_.length-2; i++)
  {
    for (let j = i+1; j < hyperplanes_.length-1; j++)
    {
      for (let k = j+1; k < hyperplanes_.length; k++)
      {
        const A = new Matrix([
          hyperplanes_[i].vector, 
          hyperplanes_[j].vector, 
          hyperplanes_[k].vector 
        ]);
        const b = new Vector([
          hyperplanes_[i].scalar, 
          hyperplanes_[j].scalar, 
          hyperplanes_[k].scalar
        ]);
        // 線形従属の場合はスキップ
        if (A.det() == 0)
        {
          continue;
        }
        // 交点を計算
        const x = A.inv().vdot(b);
        // 実行不能の場合はスキップ
        if (!isFeasible(x, hyperplanes_))
        {
          continue;
        }
        points.push(x);
      }
    }
  }

  // 重複削除
  const points_ = []
  for (const point of points)
  {
    let flag = true;
    for (const point_ of points_)
    {
      if (Math.round(point.distance(point_)*100000)/100000 == 0)
      {
        flag = false;
      }
    }
    if (flag)
    {
      points_.push(point);
    }
  }
  
  return points_;
}
function isFeasible(x, hyperplanes)
{
  for (const hyperplane of hyperplanes)
  {
    const r = hyperplane.vector.inner(x) - hyperplane.scalar;
    if (Math.round(r*100000)/100000 > 0)
    {
      return false;
    }
  }
  return true;
}

class Hyperplane
{
  constructor(vector, scalar, tn_p1, tn_a1, tn_p2, tn_a2, tn_p3, tn_a3, tn_b)
  {
    this.vector = vector;
    this.scalar = scalar;
    this.tn_p1 = tn_p1;
    this.tn_a1 = tn_a1;
    this.tn_p2 = tn_p2;
    this.tn_a2 = tn_a2;
    this.tn_p3 = tn_p3;
    this.tn_a3 = tn_a3;
    this.tn_b = tn_b;
    this.facet = null;
  }
  show(i)
  {
    console.log(i, 
      String(Math.round(this.vector[0]*100)/100) + " x + " +
      String(Math.round(this.vector[1]*100)/100) + " y + " +
      String(Math.round(this.vector[2]*100)/100) + " z <= " +
      String(Math.round(this.scalar*100)/100));
  }
}