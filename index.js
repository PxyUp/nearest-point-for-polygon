const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

let r = 1;

let animation = 0;

let max_r = document.getElementById("radius").value;

let polygon = []

const width = 1000;
const height = 400;

canvas.width = width;
canvas.height = height;

const getRelativeCord = (x, y) => {
    return [width / 2 - x, height / 2 - y];
}

const getLine = (x1, y1, x2, y2) => ({
    A: y1 - y2,
    B: x2 - x1,
    C: x1 * y2 - x2 * y1,
})

const getRotateLine = (a, b, c, x1, y1) => ({
    A: -b,
    B: a,
    C: b * x1 - a * y1
})

const newArc = (x, y, x1, y1, x2, y2, r) => ({
    x: x,
    y,
    type: 'arc',
    r: r,
    // @TODO check when should be reverse
    startAngle: Math.atan2(x1 - x, y1 - y),
    endAngle: Math.atan2(x2 - x, y2 - y),
    moveToBefore: [x1, y1],
    moveToAfter: [x2, y2]
})


const getNewPoint = (r, a1, b1, c1, a2, b2, c2, x1, y1, flag) => {
    let y
    // @TODO check when should be reverse
    if (!flag) {
        y = -(r * Math.sqrt(a1 ** 2 + b1 ** 2) - a1 / a2 * c2 + c1) / (b1 - a1 * b2 / a2)
    } else {
        y = (r * Math.sqrt(a1 ** 2 + b1 ** 2) + a1 / a2 * c2 - c1) / (b1 - a1 * b2 / a2)
    }
    return {
        x: (-c2 - b2 * y) / a2,
        y,
        type: 'point'
    }
}

const recreate = () => {
  polygon = [];
  let points = Math.floor(Math.random() * 15 + 5);

  for (let index = 0; index < points; index++) {
    polygon.push({
      x:0+Math.sin(Math.PI * 2 / points * -index) * (Math.random()*80 + 30)+(Math.random()*80-40),
      y:0+Math.cos(Math.PI * 2 / points * -index) * (Math.random()*80 + 30)+(Math.random()*80-40),
      type:'point'
    })
  }
  draw(polygon, polygon);
}

const draw = (path, original) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#cccccc";
    ctx.strokeStyle = "#cccccc";
    ctx.beginPath();
    const items = (path || [])
    items.forEach((item, index) => {
        if (!index) {
            ctx.moveTo(...getRelativeCord(item.x, item.y))
            return
        }
        if (item.type === 'point') {
            ctx.lineTo(...getRelativeCord(item.x, item.y))
        }
        if (item.type === 'arc') {
            ctx.moveTo(...getRelativeCord(item.moveToAfter))
            ctx.arc(...getRelativeCord(item.x, item.y), item.r, 0, 2 * Math.PI)
            ctx.moveTo(...getRelativeCord(item.moveTo))
        }
    })
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(200, 230, 200, 0.5)";
    ctx.strokeStyle = "#500000";
    ctx.beginPath();
    const originalItems = (original || [])
    originalItems.forEach((item, index) => {
        if (!index) {
            ctx.moveTo(...getRelativeCord(item.x, item.y))
            return
        }
        if (item.type === 'point') {
            ctx.lineTo(...getRelativeCord(item.x, item.y))
        }

    })
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


const extend = (path, r) => {
    const newPath = [];
    const items = path || [];
    if (items.length >= 2) {
        for (let index = 0; index < items.length; index++) {
            const nextIndex = index === items.length - 1 ? 0 : index + 1;
            const currentPoint = items[index]
            const nextPoint = items[nextIndex]
            const line = getLine(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
            const rotateLine1 = getRotateLine(line.A, line.B, line.C, currentPoint.x, currentPoint.y)
            const rotateLine2 = getRotateLine(line.A, line.B, line.C, nextPoint.x, nextPoint.y)
            const newPointOne = getNewPoint(r, line.A, line.B, line.C, rotateLine1.A, rotateLine1.B, rotateLine1.C, currentPoint.x, currentPoint.y)
            const newPointTwo = getNewPoint(r, line.A, line.B, line.C, rotateLine2.A, rotateLine2.B, rotateLine2.C, nextPoint.x, nextPoint.y)
            if (index > 0) {
                newPath.push(newArc(currentPoint.x, currentPoint.y, newPath[newPath.length - 1].x, newPath[newPath.length - 1].y, newPointOne.x, newPointOne.y, r))
            }
            newPath.push(newPointOne, newPointTwo)
            if (index === items.length - 1) {
                newPath.push(newArc(items[0].x, items[0].y, newPointTwo.x, newPointTwo.y, newPath[0].x, newPath[0].y, r))
            }
            if (items.length == 2) {
                break;
            }
        }
    }
    return newPath
}

const redraw = (polygon) => {
    (r < max_r) ? r++ : r;
    if (r < max_r) {
      window.requestAnimationFrame(() => redraw(polygon));
      const path = extend(polygon, r)
      draw(path, polygon)
    }
}

recreate();
draw(polygon, polygon)


const btn = document.getElementById("extend")
btn.addEventListener('click', () => {
    r = 0;
    max_r = document.getElementById("radius").value;
    window.requestAnimationFrame(function(){redraw(polygon)});
})

const rec = document.getElementById("recreate")
rec.addEventListener('click', () => {
  recreate();
})

const res = document.getElementById("reset")
res.addEventListener('click', () => {
  draw(polygon, polygon);
})
