import Node from "./node";
import { isArr, isNumber } from "../utils/tool.js";

const _transformRadius = Symbol("_transformRadius");
const _buildPath = Symbol("_buildPath");

class Rect extends Node {
  constructor(args) {
    super(args);
    this.name = "$$rect";
  }

  /* override */
  createPath() {
    this.paths = [];
    const { pos, size, borderRadius } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    const radius = borderRadius || 0;
    this.setOffsetAnchor();
    if (!radius) {
      this.paths.push({
        type: "rect",
        args: [x, y, width, height],
      });
    } else {
      this[_buildPath](x, y, width, height, radius);
    }
  }

  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移
  setOffsetAnchor() {
    const { pos, size, anchor } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    let offsetRateX = 0.5;
    let offsetRateY = 0.5;
    if (anchor) {
      [offsetRateX, offsetRateY] = anchor;
    }
    this.anchorX = x + width * offsetRateX;
    this.anchorY = y + height * offsetRateY;
  }

  /* override */
  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    const { offsetX, offsetY } = event;
    const { pos, size } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    // TODO: 优化弧形点击
    if (
      offsetX > x &&
      offsetX < x + width &&
      offsetY > y &&
      offsetY < y + height
    ) {
      return true;
    }
    return false;
  }

  [_transformRadius](r, width, height) {
    var r1;
    var r2;
    var r3;
    var r4;
    // 支持形式的 radius 入参
    if (isNumber(r)) {
      r1 = r2 = r3 = r4 = r;
    } else if (isArr(r)) {
      if (r.length === 1) {
        r1 = r2 = r3 = r4 = r[0];
      } else if (r.length === 2) {
        r1 = r3 = r[0];
        r2 = r4 = r[1];
      } else if (r.length === 3) {
        r1 = r[0];
        r2 = r4 = r[1];
        r3 = r[2];
      } else {
        r1 = r[0];
        r2 = r[1];
        r3 = r[2];
        r4 = r[3];
      }
    } else {
      r1 = r2 = r3 = r4 = 0;
    }
    // 边界值矫正
    var total;
    if (r1 + r2 > width) {
      total = r1 + r2;
      r1 *= width / total;
      r2 *= width / total;
    }
    if (r3 + r4 > width) {
      total = r3 + r4;
      r3 *= width / total;
      r4 *= width / total;
    }
    if (r2 + r3 > height) {
      total = r2 + r3;
      r2 *= height / total;
      r3 *= height / total;
    }
    if (r1 + r4 > height) {
      total = r1 + r4;
      r1 *= height / total;
      r4 *= height / total;
    }
    return [r1, r2, r3, r4];
  }

  [_buildPath](x, y, width, height, r) {
    if (width < 0) {
      x = x + width;
      width = -width;
    }
    if (height < 0) {
      y = y + height;
      height = -height;
    }
    const [r1, r2, r3, r4] = this[_transformRadius](r, width, height);
    this.paths.push({
      type: "moveTo",
      args: [x + r1, y],
    });
    this.paths.push({
      type: "arcTo",
      args: [x + width, y, x + width, y + r2, r2],
    });
    this.paths.push({
      type: "arcTo",
      args: [x + width, y + height, x + width - r3, y + height, r3],
    });
    this.paths.push({
      type: "arcTo",
      args: [x, y + height, x, y + height - r4, r4],
    });
    this.paths.push({
      type: "arcTo",
      args: [x, y, x + r1, y, r1],
    });
  }
}

export default Rect;
