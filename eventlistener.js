class EventListenerBase
{
  getCursor(event)
  {
    return new Vector([ 
      event.offsetX,
      event.offsetY,
      0
    ]);
  }
  projectToCircle(point)
  {
    point = point.copy();
    if (round(point.norm()) <= 1)
    {
      return point;
    }
    return point.sdiv(point.norm());
  }
  projectToBall(point)
  {
    point = point.copy();
    point[2] = Math.sqrt(round((1-point[0]**2-point[1]**2)));
    return point;
  }
  
  isOutOfCircle(event)
  {
    const cursor = this.basis.canvasToStandard(this.getCursor(event));
    return cursor.norm() > 1;
  }

  isClickedVector(event)
  {
    return this.selectHalfspace(event) != null;
  }
  selectHalfspace(event)
  {
    const cursor = this.getCursor(event);
    for (const halfspace of this.polyhedron)
    {
      const vector = this.basis.originalToCanvas(halfspace.vector);

      if (vector[2] < 0)
      {
        continue;
      }

      vector[2] = 0;
      if (vector.distance(cursor) <= this.renderer.canvas.vector.radius)
      {
        return halfspace;
      }
    }
    return null;
  }
}

// ベクトル選択
class EventListenerSelectHalfspace extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    this.halfspace = null;

    canvas.addEventListener("mousedown", (event)=>this.mousedown(event));

    return;
  }

  mousedown(event)
  {
    if (this.halfspace != null)
    {
      this.halfspace.isSelected = false;
      this.renderer.draw();
    }

    this.halfspace = this.selectHalfspace(event);

    if (this.halfspace != null)
    {
      this.halfspace.isSelected = true;
      this.renderer.draw();
    }

    return;
  }
}

// 半空間追加
class EventListenerCreateHalfspace extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    canvas.addEventListener("mousedown", (event)=>this.mousedown(event));
    canvas.addEventListener("mousemove", (event)=>this.mousemove(event));
    canvas.addEventListener("mouseup", (event)=>this.mouseup(event));

    this.isMousedown = false;

    return;
  }

  mousedown(event)
  {
    if (this.isOutOfCircle(event))
    {
      return;
    }

    if (this.isClickedVector(event))
    {
      return;
    }

    this.isMousedown = true;

    return;
  }

  mousemove(event)
  {
    this.isMousedown = false;
    return;
  }

  mouseup(event)
  {
    if (!this.isMousedown)
    {
      return;
    }

    // カーソルを取得
    let cursor = this.getCursor(event);
    cursor = this.basis.canvasToStandard(cursor);
    cursor = this.projectToBall(cursor);
    cursor = this.basis.standardToOriginal(cursor);

    // 半空間を生成
    const halfspace = new Halfspace(cursor);

    // 多面体に半空間を追加
    this.polyhedron.push(halfspace);

    // テーブルに追加
    this.renderer.table.add(halfspace);

    // 設定をクリア
    this.isMousedown = false;

    // 描画を更新
    this.renderer.draw();

    return;
  }
}

// ベクトル更新
class EventListenerUpdateHalfspaceVector extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer, elsh)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    this.elsh = elsh;

    this.isMousedown = false;

    canvas.addEventListener("mousedown", (event)=>this.mousedown(event));
    canvas.addEventListener("mousemove", (event)=>this.mousemove(event));
    canvas.addEventListener("mouseup", (event)=>this.mouseup(event));
    canvas.addEventListener("mouseout", (event)=>this.mouseout(event));

    return;
  }

  mousedown(event)
  {
    this.isMousedown = true;
    return;
  }

  mousemove(event)
  {
    if (!this.isMousedown)
    {
      return;
    }

    if (this.elsh.halfspace == null)
    {
      return;
    }

    // カーソルを取得
    let cursor = this.getCursor(event);
    cursor = this.basis.canvasToStandard(cursor);
    cursor = this.projectToCircle(cursor);
    cursor = this.projectToBall(cursor);
    cursor = this.basis.standardToOriginal(cursor);

    // 選択中の半空間のベクトルを更新
    this.elsh.halfspace.vector = cursor;

    // 描画を更新
    this.renderer.draw(true);

    return;
  }

  mouseup(event)
  {
    this.isMousedown = false;
    return;
  }

  mouseout(event)
  {
    this.isMousedown = false;
    return;
  }
}

// スカラ更新
class EventListenerUpdateHalfspaceScalar extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer, elsh)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    this.elsh = elsh;

    canvas.addEventListener("mousewheel", (event)=>this.mousewheel(event));

    return;
  }

  mousewheel(event)
  {
    if (this.elsh.halfspace == null)
    {
      return;
    }

    this.elsh.halfspace.scalar += (event.deltaY <= 0) ? +0.01 : -0.01;
    this.elsh.halfspace.scalar = Math.max(this.elsh.halfspace.scalar, 0);

    this.renderer.draw();

    return;
  }
}

// スケール更新
class EventListenerUpdateScale extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer, elsh)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    this.elsh = elsh;

    this.dscale = 0.01;

    canvas.addEventListener("mousewheel", (event)=>this.mousewheel(event));

    return;
  }

  mousewheel(event)
  {
    if (this.elsh.halfspace != null)
    {
      return;
    }

    this.basis.scale += (event.deltaY <= 0) ? +this.dscale : -this.dscale;
    this.basis.scale = Math.max(this.basis.scale, this.dscale);

    this.renderer.draw();

    console.log("EventListenerUpdateScale", this.basis.scale);

    return;
  }
}

// 基底更新
class EventListenerUpdateBasis extends EventListenerBase
{
  constructor(polyhedron, basis, canvas, renderer, elsh)
  {
    super();

    this.polyhedron = polyhedron;
    this.basis = basis;
    this.renderer = renderer;

    this.elsh = elsh;

    this.isMousedown = false;
    this.cursorMousedown = null;
    this.basisMousedown = null;

    canvas.addEventListener("mousedown", (event)=>this.mousedown(event));
    canvas.addEventListener("mousemove", (event)=>this.mousemove(event));
    canvas.addEventListener("mouseup", (event)=>this.mouseup(event));
    canvas.addEventListener("mouseout", (event)=>this.mouseout(event));

    return;
  }

  mousedown(event)
  {
    if (this.elsh.halfspace != null)
    {
      return;
    }

    this.isMousedown = true;

    this.cursorMousedown = this.getCursor(event);
    this.cursorMousedown = this.basis.canvasToStandard(this.cursorMousedown);
    this.cursorMousedown = this.projectToCircle(this.cursorMousedown);
    this.cursorMousedown = this.projectToBall(this.cursorMousedown);
    
    this.basisMousedown = this.basis.copy();

    return;
  }

  mousemove(event)
  {
    if (!this.isMousedown)
    {
      return;
    }

    const axis = this.getAxis(event);
    const angle = this.getAngle(event);

    if (angle == 0)
    {
      return;
    }

    for (let i = 0; i < 3; i++)
    {
      this.basis[i] = this.rotate(this.basisMousedown[i], axis, angle);
    }

    this.renderer.draw(true);

    return;
  }
  getAxis(event)
  {
    let cursor = this.getCursor(event);
    cursor = this.basis.canvasToStandard(cursor);
    cursor = this.projectToCircle(cursor);
    cursor = this.projectToBall(cursor);

    let axis = this.cursorMousedown.outer(cursor);
    axis = axis.sdiv(axis.norm());

    return axis;
  }
  getAngle(event)
  {
    let cursor = this.getCursor(event);
    cursor = this.basis.canvasToStandard(cursor);
    cursor = this.projectToCircle(cursor);
    cursor = this.projectToBall(cursor);

    const angle = Math.acos(this.cursorMousedown.inner(cursor)/(this.cursorMousedown.norm()*cursor.norm()));

    return angle;
  }
  rotate(vector, axis, angle)
  {
    return (vector.smul(Math.cos(angle)))
      .vadd(axis.smul((1-Math.cos(angle))*vector.inner(axis)))
      .vadd(axis.outer(vector).smul(Math.sin(angle)));
  }

  mouseup(event)
  {
    this.isMousedown = false;
    this.cursorMousedown = null;
    this.basisMousedown = null;
    return;
  }

  mouseout(event)
  {
    this.isMousedown = false;
    this.cursorMousedown = null;
    this.basisMousedown = null;
    return;
  }
}