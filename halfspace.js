let ID = 0;
class Halfspace
{
  constructor(vector, scalar=1, id=null)
  {
    if (id == null)
    {
      this.id = ID;
      ID++;
    }
    else
    {
      this.id = id;
    }
    this.vector = vector;
    this.scalar = scalar;
    this.isSelected = false;
    this.color = "blue";
    return;
  }
}