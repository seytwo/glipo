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
}
