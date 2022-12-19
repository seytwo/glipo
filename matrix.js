class Vector extends Array
{
  constructor(data)
  {
    super(data.length);
    for (let i = 0; i < this.length; i++)
    {
      this[i] = data[i];
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

  sadd(other)
  {
    return this.sope(other, (x, y)=>x+y);
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

class Matrix extends Array
{
  constructor(vectors)
  {
    super(vectors.length);
    for (let i = 0; i < this.length; i++)
    {
      this[i] = vectors[i].copy();
    }
  }

  det()
  {
    return this[0][0]*this[1][1]*this[2][2]
      + this[0][1]*this[1][2]*this[2][0]
      + this[0][2]*this[1][0]*this[2][1]
      - this[0][0]*this[1][2]*this[2][1]
      - this[0][2]*this[1][1]*this[2][0]
      - this[0][1]*this[1][0]*this[2][2];
  }

  inv()
  {
    const det = this.det();
    return new Matrix([
      (new Vector([
        +this[1][1]*this[2][2]-this[1][2]*this[2][1],
        -this[0][1]*this[2][2]+this[0][2]*this[2][1],
        +this[0][1]*this[1][2]-this[0][2]*this[1][1]
      ])).sdiv(det),
      (new Vector([
        -this[1][0]*this[2][2]+this[1][2]*this[2][0],
        +this[0][0]*this[2][2]-this[0][2]*this[2][0],
        -this[0][0]*this[1][2]+this[0][2]*this[1][0]
      ])).sdiv(det),
      (new Vector([
        +this[1][0]*this[2][1]-this[1][1]*this[2][0],
        -this[0][0]*this[2][1]+this[0][1]*this[2][0],
        +this[0][0]*this[1][1]-this[0][1]*this[1][0]
      ])).sdiv(det)
    ]);
  }

  mdot(other)
  {
    const matrix = new Matrix([
      new Vector([ 0, 0, 0 ]),
      new Vector([ 0, 0, 0 ]),
      new Vector([ 0, 0, 0 ])
    ]);
    for (let i = 0; i < this.length; i++)
    {
      for (let j = 0; j < this.length; j++)
      {
        for (let k = 0; k < this.length; k++)
        {
          matrix[i][j] += this[i][k] * other[k][j];
        }
      }
    }
    return matrix;
  }

  vdot(other)
  {
    const vector = new Vector([ null, null, null ]);
    for (let i = 0; i < this.length; i++)
    {
      vector[i] = this[i].inner(other);
    }
    return vector;
  }

  show()
  {
    console.log("<--");
    for (let vector of this)
    {
      vector.show();
    }
    console.log("-->");
  }

  t()
  {
    return new Matrix([
      new Vector([this[0][0], this[1][0], this[2][0]]),
      new Vector([this[0][1], this[1][1], this[2][1]]),
      new Vector([this[0][2], this[1][2], this[2][2]])
    ]);
  }

  copy()
  {
    return new Matrix([
      this[0].copy(),
      this[1].copy(),
      this[2].copy()
    ]);
  }
}
