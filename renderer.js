class Renderer
{
  constructor(polyhedron, basis, canvasVector, canvasPolyhedron, tbody)
  {
    this.canvas = new RendererCanvas(polyhedron, basis, canvasVector, canvasPolyhedron);
    this.table = new RendererTable(polyhedron, tbody);
    this.last = 0;
    this.dtime = 10;
    return;
  }

  draw(useTimeCancel=false)
  {
    if (!useTimeCancel | (Date.now() >= this.last+this.dtime))
    {
      this.canvas.draw();
      this.table.draw();
      this.last = Date.now();
    }
    return;
  }
}

class RendererCanvas
{
  constructor(polyhedron, basis, canvasVector, canvasPolyhedron)
  {
    this.vector = new RendererCanvasVector(polyhedron, basis, canvasVector);
    this.polyhedron = new RendererCanvasPolyhedron(polyhedron, basis, canvasPolyhedron);
    return;
  }

  draw()
  {
    this.vector.draw();
    this.polyhedron.draw();
    return;
  }
}

class RendererCanvasBase
{
  constructor(polyhedron, basis, canvas)
  {
    this.polyhedron = polyhedron;
    this.basis = basis;
    this.canvas = canvas;
    return;
  }
  
  clear()
  {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return;
  }
}

class RendererCanvasVector extends RendererCanvasBase
{
  constructor(polyhedron, basis, canvas)
  {
    super(polyhedron, basis, canvas);
    this.radius = 5;
    this.radiusSelected = this.radius+2;
    return;
  }

  draw()
  {
    this.clear();

    this.drawCircle();

    for (const halfspace of this.polyhedron)
    {
      this.drawVector(halfspace);
    }

    return;
  }

  drawCircle()
  {
    const context = this.canvas.getContext("2d");
  
    context.beginPath();
    const radius = this.canvas.width/2;
    context.arc(radius, radius, radius, 0, 2*Math.PI);
  
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.globalAlpha = 1;
    context.stroke();
  
    context.fillStyle = "blue";
    context.globalAlpha = 0.5;
    context.fill();
  
    return;
  }

  drawVector(halfspace)
  {
    if (halfspace.isSelected)
    {
      this.drawVectorPoint(halfspace, this.radiusSelected, "red");
    }

    this.drawVectorPoint(halfspace, this.radius, "black");

    this.drawVectorName(halfspace);

    return;
  }
  drawVectorPoint(halfspace, size, color)
  {
    const vector = this.basis.originalToCanvas(halfspace.vector);

    const context = this.canvas.getContext("2d");

    context.beginPath();
    context.arc(vector[0], vector[1], size, 0, 2*Math.PI);

    context.strokeStyle = color;
    context.lineWidth = 1;
    context.globalAlpha = 1;
    context.stroke();

    context.fillStyle = color;
    context.globalAlpha = (vector[2] >= 0) ? 1 : 0.3;
    context.fill();

    return;
  }
  drawVectorName(halfspace)
  {
    const vector = this.basis.originalToCanvas(halfspace.vector);

    const context = this.canvas.getContext("2d");

    context.fillStyle = "black";
    context.globalAlpha = (vector[2] >= 0) ? 1 : 0.3;
    context.fillText(halfspace.id, vector[0]+5, vector[1]+5);

    return;
  }
}

class RendererCanvasPolyhedron extends RendererCanvasBase
{
  constructor(polyhedron, basis, canvas)
  {
    super(polyhedron, basis, canvas);
    return;
  }

  draw()
  {
    this.clear();

    for (const halfspace of this.polyhedron)
    {
      const facet = this.getFacet(halfspace);
      this.drawFacet(halfspace, facet);
      this.drawFacetName(halfspace, facet);
    }

    this.drawComplementaryPoints();

    return;
  }
  
  getFacet(halfspace)
  {
    const facet = this.getPoints(halfspace);

    if (facet.length == 0)
    {
      return facet;
    }

    // ファセットの中心を計算
    const centor = this.getCentor(facet);

    facet.sort((point1, point2)=>{
      const diff1 = point1.vsub(centor);
      const diff2 = point2.vsub(centor);
      const degree1 = Math.atan2(diff1[1], diff1[0])
      const degree2 = Math.atan2(diff2[1], diff2[0])
      return degree1-degree2;
    });
  
    return facet;
  }
  getPoints(halfspace)
  {
    // 超平面（枠を含む）
    const basisInv = this.basis.t().inv().t();
    const polyhedron = [
      new Halfspace(basisInv[0], this.basis.scale, "+e1"),
      new Halfspace(basisInv[0].smul(-1), this.basis.scale, "-e1"),
      new Halfspace(basisInv[1], this.basis.scale, "+e2"),
      new Halfspace(basisInv[1].smul(-1), this.basis.scale, "-e2"),
    ].concat(this.polyhedron);

    const points = [];
    for (let i = 0; i < polyhedron.length-1; i++)
    {
      for (let j = i+1; j < polyhedron.length; j++)
      {
        const A = new Matrix([
          polyhedron[i].vector, 
          polyhedron[j].vector, 
          halfspace.vector 
        ]);
        const b = new Vector([
          polyhedron[i].scalar, 
          polyhedron[j].scalar, 
          halfspace.scalar
        ]);

        // 線形従属の場合はスキップ
        if (round(A.det()) == 0)
        {
          continue;
        }

        // 交点を計算
        const x = A.inv().vdot(b);

        // 実行不能の場合はスキップ
        if (!this.isFeasible(x, polyhedron))
        {
          continue;
        }

        points.push(x);
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
  isFeasible(x, polyhedron)
  {
    for (const halfspace of polyhedron)
    {
      const r = halfspace.vector.inner(x) - halfspace.scalar;
      if (round(r) > 0)
      {
        return false;
      }
    }
    return true;
  }
  getCentor(facet)
  {
    let centor = new Vector([0,0,0]);
    for (const point of facet)
    {
      centor = centor.vadd(point);
    }
    centor = centor.sdiv(facet.length);
    return centor;
  }
  isFront(halfspace)
  {
    const vector = this.basis.originalToStandard(halfspace.vector);
    return vector[2] >= 0;
  }
  drawFacet(halfspace, facet)
  {
    if (facet.length == 0)
    {
      return;
    }

    const context = this.canvas.getContext("2d");
  
    // 基底を変更
    const facet_ = [];
    for (const point of facet)
    {
      facet_.push(this.basis.originalToCanvas(point, true));
    }
    facet = facet_;
  
    context.beginPath();
    context.moveTo(facet[0][0], facet[0][1]);
    for (const point of facet.slice(1))
    {
      context.lineTo(point[0], point[1]);
    }
    context.closePath();
  
    if (this.isFront(halfspace))
    {
      context.fillStyle = halfspace.color;
      context.globalAlpha = 0.1;
      context.fill();
    }
  
    context.strokeStyle = "black";
    context.globalAlpha = this.isFront(halfspace) ? 1 : 0.1;
    context.stroke();
  
    return;
  }
  drawFacetName(halfspace, facet)
  {
    if (!this.isFront(halfspace))
    {
      return;
    }

    const context = this.canvas.getContext("2d");

    const centor = this.basis.originalToCanvas(this.getCentor(facet), true);
  
    context.fillStyle = "black";
    context.globalAlpha = 1;
    context.fillText(halfspace.id, centor[0], centor[1]);
  
    return;
  }

  drawComplementaryPoints()
  {
    for (let i = 0; i < this.polyhedron.length-2; i++)
    {
      for (let j = i+1; j < this.polyhedron.length-1; j++)
      {
        for (let k = 0; k < this.polyhedron.length; k++)
        {
            
          const A = new Matrix([
            this.polyhedron[i].vector, 
            this.polyhedron[j].vector, 
            this.polyhedron[k].vector
          ]);
          const b = new Vector([
            this.polyhedron[i].scalar, 
            this.polyhedron[j].scalar, 
            this.polyhedron[k].scalar
          ]);

          // 線形従属の場合はスキップ
          if (round(A.det()) == 0)
          {
            continue;
          }

          // 交点を計算
          const x = A.inv().vdot(b);

          // 実行不能の場合はスキップ
          if (!this.isFeasible(x, this.polyhedron))
          {
            continue;
          }

          if ((this.polyhedron[i].color != this.polyhedron[j].color) 
              && (this.polyhedron[i].color != this.polyhedron[k].color)
              && (this.polyhedron[j].color != this.polyhedron[k].color))
          {
            this.drawVectorPoint(x);
          }
        }
      }
    }

    return;
  }
  drawVectorPoint(vector)
  {
    vector = this.basis.originalToCanvas(vector, true);

    const context = this.canvas.getContext("2d");

    context.beginPath();
    context.arc(vector[0], vector[1], 5, 0, 2*Math.PI);

    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.globalAlpha = 1;
    context.stroke();

    context.fillStyle = "red";
    context.globalAlpha = 1;
    context.fill();

    return;
  }


}

class RendererTable
{
  constructor(polyhedron, tbody)
  {
    this.polyhedron = polyhedron;
    this.tbody = tbody;
    this.rows = {};
    return;
  }

  draw()
  {
    for (const halfspace of this.polyhedron)
    {
      const row = this.rows[halfspace.id];
      row.tn_p1.data = (halfspace.vector[0] >= 0) ? ("") : ("-");
      row.tn_a1.data = Math.round(Math.abs(halfspace.vector[0])*100)/100;
      row.tn_p2.data = (halfspace.vector[1] >= 0) ? ("+") : ("-");
      row.tn_a2.data = Math.round(Math.abs(halfspace.vector[1])*100)/100;
      row.tn_p3.data = (halfspace.vector[2] >= 0) ? ("+") : ("-");
      row.tn_a3.data = Math.round(Math.abs(halfspace.vector[2])*100)/100;
      row.tn_b.data = Math.round(halfspace.scalar*100)/100;
    }
    return;
  }
  
  add(halfspace)
  {
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
    const tn_idx = document.createTextNode("["+String(halfspace.id)+"]");
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

    this.tbody.appendChild(tr);
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

    this.rows[halfspace.id] = {
      tn_p1: tn_p1,
      tn_a1: tn_a1,
      tn_p2: tn_p2,
      tn_a2: tn_a2,
      tn_p3: tn_p3,
      tn_a3: tn_a3,
      tn_b: tn_b
    };

    return;
  }
}