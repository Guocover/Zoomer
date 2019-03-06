/**
 * 指定物体位移伸缩组件
 */

function Zoomer(opts = {}) {
  this.$target = $(opts.target);
  this.$container = $(opts.container);
  console.log('init', this.$container.length, this.$target.length)
  this.init();
}

Zoomer.prototype = {
  // 初始化
  init(opts) {
    const self = this;

    this.x = 0;
    this.y = 0;
    this.buffMove   = 3; //缓冲系数
    this.buffScale  = 2; //放大系数
    this.curScale = 1;
    this.fingers = false; //触摸手指的状态 false：单手指 true：多手指

    this.$container.on('touchstart', (e) => {
      self._touchstart(e);
    });
    this.$container.on('touchmove', (e) => {
      self._touchmove(e);
    });
    this.$container.on('touchend', (e) => {
      self._touchend(e);
    });

  },
  _touchstart(e) {
    // 获取开始坐标
    this.curPostionX = e.targetTouches[0].pageX;
    this.curPostionY = e.targetTouches[0].pageY;

    const fingerNum = e.targetTouches.length;
     // 如果是双指运动,则放大
    if (fingerNum == 1) {
      this.fingers = false; 
      // this._doZoom(this._gesturePinchZoom(e.targetTouches));
    } else {
      this.fingers = true;
      this.startFingerDist = this._getTouchDist(e.targetTouches);
    }
    
  },
  _touchmove(e) {
    e.preventDefault();
    const fingerNum = e.targetTouches.length;
    const newPostionX = e.targetTouches[0].pageX;
    const newPostionY = e.targetTouches[0].pageY;

    // 如果是双指运动,则放大
    if (fingerNum >= 2) {
      this._doZoom(e.targetTouches);
    } 

    // 如果是单指头，则移动就好
    if (fingerNum == 1 && !this.fingers) {
      const addX = newPostionX - this.curPostionX;
      const addY = newPostionY - this.curPostionY;

      // 展示移动
      this._doMove(addX, addY);
    }

    this.curPostionX = newPostionX;
    this.curPostionY = newPostionY;
  },
  _touchend(e) {
    if (this.nextScale) {
      this.curScale = this.nextScale;
    }
  },
  // 计算放大比例
  _getTouchDist: function(touches) {
    let dist = false;

    if (touches.length >= 2) {
      // 手指 1 和 2
      const p1 = touches[0];
      const p2 = touches[1];

      // 计算
      dist = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)); 
    }
    return dist;
  },
  _doZoom(touches) {
    const nowFingerDist = this._getTouchDist(touches); //获得当前长度
    let ratio = nowFingerDist / this.startFingerDist; //计算缩放比

    this.nextScale = ratio * this.curScale;

    // 最多放大2倍
    if (this.nextScale >=2) {
      this.nextScale = 2;
    }

    if (this.nextScale < 1) {
      this.nextScale = 1;
      this.$target.css({
        top: 0,
        left: 0
      });
    }

    // console.log('zoom', this.nextScale, this.$target);
    this.$target.css({
      '-webkit-transform': `scale(${this.nextScale})`,
      transform: `scale(${this.nextScale})`
    });
  },
  _doMove(addX, addY) {
    const curScale = this.curScale;
    const containerWidth = this.$container.width();
    const containerHeight = this.$container.height();

    // 如果比例小于 1 则不能移动
    if (curScale <= 1) {
      this.x = 0;
      this.y = 0;
    } else {

      this.x += addX ;
      this.y += addY;
      const scaleAdd = curScale - 1;
      const limitX = scaleAdd * containerWidth / 2;
      const limitY = scaleAdd * containerHeight / 2;;

      if (this.x >= limitX) {
        this.x = limitX;
      }
      if (this.x <= -limitX) {
        this.x = -limitX;
      }
      if (this.y >= limitY) {
        this.y = limitY;
      }
      if (this.y <= -limitY) {
        this.y = -limitY;
      }
    }


    this.$target.css({
      top: this.y,
      left: this.x
    });
  }
};


module.exports = Zoomer;
