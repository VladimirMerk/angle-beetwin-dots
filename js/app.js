{
  const mainElement = document.querySelector('main');
  const movablePointElements = document.querySelectorAll('.point');
  const checkboxes = document.querySelectorAll('#controls input[type="checkbox"]');
  const captionElement = document.getElementById('caption');
  const arrowElement = document.getElementById('arrow');
  const distanceCaptionElement = document.getElementById('distance-caption');
  const mainCanvasElement = document.getElementById('main-canvas');
  const mainCTX = mainCanvasElement.getContext('2d');
  const multiplyElement = document.getElementById('multiply')
  const angleElement = document.getElementById('angle')

  let dragMode = document.querySelector('.point.select') ? true : false;

  for (const pointElement of movablePointElements) {
    pointElement.addEventListener('mousedown', onDown);
    pointElement.addEventListener('touchstart', onDown);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);
  document.addEventListener('change', onMove);

  clearCanvas();

  function onDown(e) {
    enableDragMode();
    selectPointElement(e.target);
  }

  function onMove(e) {
    writeCaption(`x: ${e.pageX}\n y: ${e.pageY}`);

    clearCanvas();
    hideMidpointCaption();

    setArrowDirection();
    drawIntermediatePoints();
    makeBezier();

    const options = getOptions();
    for (const option of options) {
      if (!option.enable) continue;
      switch (option.name) {
        case 'distance':
          drawMidpointCaption();
        break;
        case 'circles':
          makeCircles();
        break;
        case 'triangles':
          makeTriangles();
        break;
      }
    }

    if (dragMode) {
      moveSelectedPointElement(e.pageX, e.pageY);
    }
  }

  function onUp(e) {
    disableDragMode();
    unselectAllPointElements();
  }

  function getOptions() {
    return Array.from(checkboxes).map(checkbox => {
      return {
        'name': checkbox.name,
        'enable': checkbox.checked
      };
    });
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

  function setArrowDirection() {
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const angle = calculateAngleBetweenTwoPoints(
      terminalPoints[0],
      terminalPoints[1]
    );
    setElementRotate(arrow, angle - 90);
  }

  function getCoordinatesIntermediatePoints() {
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const midpoint = calculateMidpointBetweenTwoDots(
      terminalPoints[0],
      terminalPoints[1]
    );
    const firstpoint = calculateMidpointBetweenTwoDots(
      terminalPoints[0],
      midpoint
    );
    const lastpoint = calculateMidpointBetweenTwoDots(
      midpoint,
      terminalPoints[1]
    );

    return [firstpoint, midpoint, lastpoint]
  }

  function drawIntermediatePoints() {
    const points = getCoordinatesIntermediatePoints();
    for (point of points) {
      drawDot(point);
    }
  }

  function makeTriangles(threePoints) {
    const multiplier = +multiplyElement.value;
    const angleShift = +angleElement.value;
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const intermediatePoints = getCoordinatesIntermediatePoints();
    const angle = calculateAngleBetweenTwoPoints(
      terminalPoints[0],
      terminalPoints[1]
    );
    let radius = calculateDistanceBetweenTwoDots(
      terminalPoints[0],
      intermediatePoints[0]
    );

    radius *= multiplier;

    const firstReference = getPointCoordinatesByDistance(
      intermediatePoints[0],
      angle + angleShift,
      radius
    );

    const lastReference = getPointCoordinatesByDistance(
      intermediatePoints[2],
      angle - angleShift,
      radius
    );

    drawLine(terminalPoints[0], firstReference);
    drawLine(firstReference, intermediatePoints[1]);
    drawLine(intermediatePoints[1], lastReference);
    drawLine(lastReference, terminalPoints[1]);
  }

  function makeBezier() {
    bezierCoordinates = calculateReferencePoints()
    drawBezier(...bezierCoordinates)
  }

  function calculateReferencePoints() {
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const intermediatePoints = getCoordinatesIntermediatePoints();
    const angle = calculateAngleBetweenTwoPoints(...terminalPoints);
    const multiplier = +multiplyElement.value;
    const angleShift = +angleElement.value;
    let distance = calculateDistanceBetweenTwoDots(
      terminalPoints[0],
      intermediatePoints[0]
    );

    distance *= multiplier;

    const firstReference = getPointCoordinatesByDistance(
      intermediatePoints[0],
      angle + angleShift,
      distance
    );

    const lastReference = getPointCoordinatesByDistance(
      intermediatePoints[2],
      angle - angleShift,
      distance
    );

    return [
      terminalPoints[0].x,
      terminalPoints[0].y,
      ...Object.values(firstReference),
      ...Object.values(lastReference),
      terminalPoints[1].x,
      terminalPoints[1].y,
    ]
  }

  function getPointCoordinatesByDistance(coordinates, angle, distance) {
    const rads = angle * Math.PI / 180;
    const [
      widthViewport90,
      widthViewport10,
      heightViewport90,
      heightViewport10
    ] = [
      window.innerWidth / 100 * 90,
      window.innerWidth / 100 * 10,
      window.innerHeight / 100 * 90,
      window.innerHeight / 100 * 10
    ]
    const result = {
      x: coordinates.x + distance * Math.cos(rads),
      y: coordinates.y + distance * Math.sin(rads)
    };

    if (result.x < widthViewport10) {
      result.x = widthViewport10
    }
    if (result.x > widthViewport90) {
      result.x = widthViewport90;
    }
    if (result.y < heightViewport10) {
      result.y = heightViewport10
    }
    if (result.y > heightViewport90) {
      result.y = heightViewport90;
    }

    return result;
  }

  function hideMidpointCaption() {
    distanceCaptionElement.hidden = true;
  }

  function drawMidpointCaption() {
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const distance = calculateDistanceBetweenTwoDots(
      terminalPoints[0],
      terminalPoints[1]
    );
    const midpoint = calculateMidpointBetweenTwoDots(
      terminalPoints[0],
      terminalPoints[1]
    );
    const angle = calculateAngleBetweenTwoPoints(
      terminalPoints[0],
      terminalPoints[1]
    );
    // Fix an angle so that a label does not turn upside down
    const fixAngle = angle > 90 || angle < -90 ? angle - 180 : angle;

    distanceCaptionElement.hidden = false;

    setElementPosition(
      distanceCaptionElement,
      midpoint.x - (shift = (distanceCaptionElement.offsetWidth / 2)),
      midpoint.y - (shift = (distanceCaptionElement.offsetHeight / 2))
    );

    setElementRotate(distanceCaptionElement, fixAngle);

    distanceCaptionElement.innerText = Math.trunc(distance);
  }

  function makeCircles() {
    const terminalPoints = getCoordinatesFirstAndLastPoints();
    const intermediatePoints = getCoordinatesIntermediatePoints();
    const multiplier = +multiplyElement.value;
    let radius = calculateDistanceBetweenTwoDots(
      terminalPoints[0],
      intermediatePoints[0]
    );

    radius *= multiplier;

    for (const point of intermediatePoints) {
      drawCircle(point.x, point.y, radius)
    }
  }

  function clearCanvas() {
    const [
      width,
      height
    ] = [
      mainCanvasElement.scrollWidth,
      mainCanvasElement.scrollHeight
    ];

    mainCTX.canvas.width  = width;
    mainCTX.canvas.height = height;
    mainCTX.clearRect(0, 0, width, height);
  }

  function drawCircle(x, y, radius) {
    mainCTX.beginPath();
    mainCTX.arc(x, y, radius, 0, 2 * Math.PI, false);
    mainCTX.stroke();
  }

  function drawLine(from, to) {
    mainCTX.beginPath();
    mainCTX.moveTo(from.x, from.y);
    mainCTX.lineTo(to.x, to.y);
    mainCTX.stroke();
  }

  function drawBezier(x, y, ...args) {
    mainCTX.beginPath();
    mainCTX.moveTo(x, y);
    mainCTX.bezierCurveTo(...args);
    mainCTX.stroke();
  }

  function drawDot(coordinates) {
    drawCircle(coordinates.x, coordinates.y, 2)
  }

  function getCoordinatesFirstAndLastPoints() {
    const firstPointElement = movablePointElements[0];
    const lastPointElement = movablePointElements[movablePointElements.length-1];
    const firstPointCoordinates = getElementCoordinates(firstPointElement);
    const lastPointCoordinates = getElementCoordinates(lastPointElement);
    return [firstPointCoordinates, lastPointCoordinates]
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
    element.attributeStyleMap.set(
      'transform',
      new CSSRotate(CSS.deg(degrees))
    );
  }

  function calculateAngleBetweenTwoPoints(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
  }

  function calculateDistanceBetweenTwoDots(from, to) {
    return Math.sqrt((from.x - to.x)**2 + (from.y - to.y)**2);
  }

  function calculateMidpointBetweenTwoDots(from, to) {
    return {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };
  }

  function enableDragMode() {
    dragMode = true;
  }

  function disableDragMode() {
    dragMode = false;
  }
}
