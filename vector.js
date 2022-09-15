class Vector extends Array
{
  constructor(data)
  {
    super(data.length); // ここから
    for (let i = 0; i < this.length; i++)
    {
      this[i] = data[i];
    }
  }

  move(other)
  {
    for (let i = 0; i < 3; i++)
    {
      this[i] = other[i];
    }
  }

  inner(other)
  {
    let scalar = 0;
    for (let i = 0; i < 3; i++)
    {
      scalar += this[i]*other[i]
    }
    return scalar;
  }
  outer(other)
  {
    const vector = new Vector([
      this[1]*other[2]-this[2]*other[1],
      this[2]*other[0]-this[0]*other[2],
      this[0]*other[1]-this[1]*other[0]
    ]);
    return vector;
  }

  vadd(other)
  {
    return this.vope(other, (x, y)=>x+y);
  }
  vsub(other)
  {
    return this.vope(other, (x, y)=>x-y);
  }
  vope(other, ope)
  {
    const vector = new Vector([ null, null, null ]);
    for (let i = 0; i < 3; i++)
    {
      vector[i] = ope(this[i], other[i]);
    }
    return vector;
  }

  smul(other)
  {
    return this.sope(other, (x, y)=>x*y);
  }
  sdiv(other)
  {
    return this.sope(other, (x, y)=>x/y);
  }
  sope(other, ope)
  {
    const vector = new Vector([ null, null, null ]);
    for (let i = 0; i < 3; i++)
    {
      vector[i] = ope(this[i], other);
    }
    return vector;
  }

  norm()
  {
    let scalar = 0;
    for (let i = 0; i < 3; i++)
    {
      scalar += this[i]**2;
    }
    scalar = Math.sqrt(scalar);
    return scalar;
  }
  distance(other)
  {
    const scalar = this.vsub(other).norm();
    return scalar;
  }

  copy()
  {
    return new Vector([
      this[0],
      this[1],
      this[2]
    ]);
  }

  show()
  {
    console.log(
      Math.round(this[0]*100)/100, 
      Math.round(this[1]*100)/100, 
      Math.round(this[2]*100)/100
    );
  }
}