{
  const points = document.querySelectorAll('.point');
  const caption = document.querySelector('#caption');
  const arrow = document.querySelector('#arrow');
  const distanceCaption = document.querySelector('#distance-caption');
  let dragMode = document.querySelector('.point.select') ? true : false;

  for (const point of points) {
    point.addEventListener('mousedown', pointDown);
  }
  document.addEventListener('mousemove', pointMove);
  document.addEventListener('mouseup', pointUp);


  function pointDown(e) {
    if (! e.target.classList.contains('select')) {
      for (const point of points) {
        point.classList.remove('select');
      }
      e.target.classList.add('select');
    }
    enableDragMode();
  }
  function pointUp(e) {
    for (const point of points) {
      point.classList.remove('select');
    }
    disableDragMode();
  }
  function pointMove(e) {
    caption.innerText = `x: ${e.pageX}\ny: ${e.pageY}`
    if (dragMode) {
      const element = document.querySelector('.point.select');
      if (element) {
        setElementPosition(element, e.pageX, e.pageY)
      }
      const coordinates = {
        x1: points[0].computedStyleMap().get('left').value,
        y1: points[0].computedStyleMap().get('top').value,
        x2: points[1].computedStyleMap().get('left').value,
        y2: points[1].computedStyleMap().get('top').value
      }
      drawLine(coordinates);
      const angle = calculateAngle(coordinates);
      setElementRotate(arrow, angle - 90);

      const distance = calculateDistance(coordinates);
      const midpoint = calculateMidpoint(coordinates);
      setElementPosition(
        distanceCaption,
        midpoint.x - (distanceCaption.offsetWidth / 2),
        midpoint.y - (distanceCaption.offsetHeight / 2));
        console.log(angle);
      setElementRotate(distanceCaption, angle > 90 || angle < -90 ? angle - 180 : angle);
      distanceCaption.innerText = Math.trunc(distance);
      //
    }
  }
  function drawLine(coordinates) {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', coordinates.x1);
    line.setAttribute('y1', coordinates.y1);
    line.setAttribute('x2', coordinates.x2);
    line.setAttribute('y2', coordinates.y2);
    line.setAttribute("stroke", "red");
    document.querySelector("#line").firstChild.replaceWith(line);
  }
  function setElementPosition(element, x, y) {
    element.attributeStyleMap.set('left', CSS.px(x))
    element.attributeStyleMap.set('top', CSS.px(y))
  }
  function setElementRotate(element, degrees) {
    element.attributeStyleMap.set('transform', new CSSRotate(CSS.deg(degrees)));
  }
  function getElementPosition() {

  }
  function calculateAngle(coordinates) {
    return Math.atan2(coordinates.y2 - coordinates.y1, coordinates.x2 - coordinates.x1) * 180 / Math.PI;
  }
  function calculateDistance(coordinates) {
    return Math.sqrt((coordinates.x1 - coordinates.x2)**2 + (coordinates.y1 - coordinates.y2)**2);
  }
  function calculateMidpoint(coordinates) {
    return {
      x: (coordinates.x1 + coordinates.x2) / 2,
      y: (coordinates.y1 + coordinates.y2) / 2
    };
  }
  function enableDragMode() {
    dragMode = true;
  }
  function disableDragMode() {
    dragMode = false;
  }
}
