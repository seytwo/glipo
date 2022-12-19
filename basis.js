class Basis extends Matrix
{
  constructor()
  {
    super([
      new Vector([1,0,0]),
      new Vector([0,1,0]),
      new Vector([0,0,1])
    ]);
    this.size = 300;
    this.scale = 5;
    return;
  }

  canvasToStandard(point, useScale=false)
  {
    const scale = useScale ? this.scale : 1;
    point = new Vector([ 
      2*scale*point[0]/this.size-1,
      1-2*scale*point[1]/this.size,
      0
    ]);
    return point;
  }
  standardToOriginal(point)
  {
    return this.t().inv().vdot(point);
  }

  originalToStandard(point)
  {
    return this.t().vdot(point);
  }
  standardToCanvas(point, useScale=false)
  {
    const scale = useScale ? this.scale : 1;
    return new Vector([
      this.size/2+point[0]*this.size/(2*scale),
      this.size/2-point[1]*this.size/(2*scale),
      point[2]
    ]);
  }
  originalToCanvas(point, useScale=false)
  {
    return this.standardToCanvas(this.originalToStandard(point), useScale);
  }
}