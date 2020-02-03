{
  const movablePointElements = document.querySelectorAll('.point');
  const captionElement = document.querySelector('#caption');
  const arrowElement = document.querySelector('#arrow');
  const distanceCaptionElement = document.querySelector('#distance-caption');
  let dragMode = document.querySelector('.point.select') ? true : false;

  for (const pointElement of movablePointElements) {
    pointElement.addEventListener('mousedown', onDown);
    pointElement.addEventListener('touchstart', onDown);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);

  function onDown(e) {
    enableDragMode();
    selectPointElement(e.target);
  }

  function onMove(e) {
    writeCaption(`x: ${e.pageX}\n y: ${e.pageY}`)

    if (! dragMode) return

    moveSelectedPointElement(e.pageX, e.pageY);
    setArrowDirection();
    drawLineElementToElement();
    drawMidpointCaption();
  }

  function onUp(e) {
    disableDragMode();
    unselectAllPointElements();
  }

  function selectPointElement(selectedPointElement) {
    if (! selectedPointElement.classList.contains('select')) {
      for (const pointElement of movablePointElements) {
        pointElement.classList.remove('select');
      }
      selectedPointElement.classList.add('select');
    }
  }

  function unselectAllPointElements(e) {
    for (const pointElement of movablePointElements) {
      pointElement.classList.remove('select');
    }
  }

  function moveSelectedPointElement(x, y) {
      const selectedPointElement = document.querySelector('.point.select');
      if (selectedPointElement) {
        setElementPosition(selectedPointElement, x, y)
      }
  }

  function writeCaption (captionText) {
    captionElement.innerText = captionText;
  }

  function drawLineElementToElement() {
    const coordinates = getCoordinatesFirstAndLastPoints();
    drawLine(coordinates);
  }


  function setArrowDirection() {
    const coordinates = getCoordinatesFirstAndLastPoints();
    const angle = calculateAngle(coordinates);
    setElementRotate(arrow, angle - 90);
  }

  function drawMidpointCaption() {
    const coordinates = getCoordinatesFirstAndLastPoints();
    const distance = calculateDistance(coordinates);
    const midpoint = calculateMidpoint(coordinates);
    const angle = calculateAngle(coordinates);
    // Fix the angle so that the label does not turn upside down
    const fixAngle = angle > 90 || angle < -90 ? angle - 180 : angle;

    setElementPosition(
      distanceCaptionElement,
      midpoint.x - (shift = (distanceCaptionElement.offsetWidth / 2)),
      midpoint.y - (shift = (distanceCaptionElement.offsetHeight / 2))
    );

    setElementRotate(distanceCaptionElement, fixAngle);

    distanceCaptionElement.innerText = Math.trunc(distance);
  }

  function drawLine(coordinates) {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    for (let [axis, value] of Object.entries(coordinates)) {
      line.setAttribute(axis, value);
    }
    line.setAttribute("stroke", "red");
    document.querySelector("#line").firstChild.replaceWith(line);
  }

  function getCoordinatesFirstAndLastPoints() {
    const firstPointElement = movablePointElements[0];
    const lastPointElement = movablePointElements[movablePointElements.length-1];
    const firstPointCoordinates = getElementCoordinates(firstPointElement);
    const lastPointCoordinates = getElementCoordinates(lastPointElement);
    return {
      x1: firstPointCoordinates.x,
      y1: firstPointCoordinates.y,
      x2: lastPointCoordinates.x,
      y2: lastPointCoordinates.y,
    }
  }

  function getElementCoordinates(element) {
    return {
      x: getValueCSSAttribute(element, 'left'),
      y: getValueCSSAttribute(element, 'top')
    }
  }

  function getValueCSSAttribute(element, attributeName) {
     return element.computedStyleMap().get(attributeName).value;
  }

  function setElementPosition(element, x, y) {
    element.attributeStyleMap.set('left', CSS.px(x))
    element.attributeStyleMap.set('top', CSS.px(y))
  }

  function setElementRotate(element, degrees) {
    element.attributeStyleMap.set('transform', new CSSRotate(CSS.deg(degrees)));
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
