import gsap from 'https://cdn.skypack.dev/gsap@3.13.0'
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable'
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4'
gsap.registerPlugin(Draggable)

const config = {
  theme: 'system',
  accent: 'hsl(10, 100%, 65%)',
  explode: false,
  viewBoxWidth: 300, // Width of the viewBox (200-350)
  bumpHeight: 40, // Height of the bump (0 = straight line)
  curveSectionWidth: 150, // Overall width of the curve section (bump width)
  curveTopWidth: 65, // Width of the curve at the top (peak) - distance between peak control points
  bumpPosition: 50, // Horizontal position of bump (0-100%, 50 = center)
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

// Get the SVG elements
const svgElement = document.querySelector('.slider svg')
const pathElement = document.querySelectorAll('.slider .track')
const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.explode = config.explode
  svgElement.style.setProperty('--accent', config.accent)
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

ctrl.on('change', sync)
update()
ctrl.addBinding(config, 'accent')
ctrl.addBinding(config, 'explode')
// Path controls
const pathCtrl = ctrl.addFolder({
  title: 'Path Controls',
  expanded: false,
})

pathCtrl.addBinding(config, 'viewBoxWidth', {
  label: 'ViewBox Width',
  min: 200,
  max: 350,
  step: 1,
})

pathCtrl.addBinding(config, 'bumpHeight', {
  label: 'Bump Height',
  min: 0,
  max: 100,
  step: 1,
})

pathCtrl.addBinding(config, 'curveSectionWidth', {
  label: 'Bump Width',
  min: 50,
  max: 300,
  step: 1,
})

pathCtrl.addBinding(config, 'curveTopWidth', {
  label: 'Curve Top Width',
  min: 20,
  max: 150,
  step: 1,
})

pathCtrl.addBinding(config, 'bumpPosition', {
  label: 'Bump Position',
  min: 0,
  max: 100,
  step: 1,
})

// Store path parameters for Y calculation
let pathParams = null

// Function to calculate Y position at a given X using binary search on Bezier curve
const getYAtX = (x0, y0, x1, y1, x2, y2, x3, y3, targetX) => {
  // Cubic Bezier: P(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
  const getX = (t) => {
    const mt = 1 - t
    return mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3
  }
  
  const getY = (t) => {
    const mt = 1 - t
    return mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3
  }
  
  // Binary search for t that gives targetX
  let tMin = 0
  let tMax = 1
  let t = 0.5
  const tolerance = 0.0001
  const maxIterations = 20
  
  for (let i = 0; i < maxIterations; i++) {
    const currentX = getX(t)
    if (Math.abs(currentX - targetX) < tolerance) break
    
    if (currentX < targetX) {
      tMin = t
    } else {
      tMax = t
    }
    t = (tMin + tMax) / 2
  }
  
  return getY(t)
}

// Function to get Y position at a given X coordinate (within viewBox width)
const getYPositionAtX = (x) => {
  if (!pathParams) return 2 // Default to baseline if path not calculated yet
  
  const { baselineY, pathStartX, curveStartX, curveEndX, pathEndX, leftControlX, centralControlX, centralControlY, curveMidX, curveMidY, rightControl1X, rightControl2X } = pathParams
  
  // Determine which segment the X falls into
  if (x <= curveStartX) {
    // Before curve - straight line
    return baselineY
  } else if (x >= curveEndX) {
    // After curve - straight line
    return baselineY
  } else if (x <= curveMidX) {
    // First curve segment
    return getYAtX(curveStartX, baselineY, leftControlX, baselineY, centralControlX, centralControlY, curveMidX, curveMidY, x)
  } else {
    // Second curve segment
    return getYAtX(curveMidX, curveMidY, rightControl1X, curveMidY, rightControl2X, baselineY, curveEndX, baselineY, x)
  }
}

// Function to update the SVG path
const updatePath = (value = undefined, bumpHeightParam = undefined) => {
  const { viewBoxWidth, bumpHeight: configBumpHeight, curveSectionWidth, curveTopWidth, bumpPosition: configBumpPosition } = config
  // Use provided value or fall back to config value, ensure it's a number
  const bumpPosition = value !== undefined ? Number(value) : Number(configBumpPosition)
  // Use provided bumpHeight or fall back to config value, ensure it's a number
  const bumpHeight = bumpHeightParam !== undefined ? Number(bumpHeightParam) : Number(configBumpHeight)
  const baselineY = 2  // Centered in viewBox, baseline at Y=2
  const totalWidth = Number(viewBoxWidth)
  const curveSectionWidthNum = Number(curveSectionWidth)
  const curveTopWidthNum = Number(curveTopWidth)
  
  // Validate all values are valid numbers
  if (isNaN(bumpPosition) || isNaN(bumpHeight) || isNaN(totalWidth) || isNaN(curveSectionWidthNum) || isNaN(curveTopWidthNum)) {
    console.warn('Invalid path parameters:', { bumpPosition, bumpHeight, totalWidth, curveSectionWidthNum, curveTopWidthNum })
    return
  }
  
  gsap.set('.slider', {
    '--viewbox-width': totalWidth,
  })
  
  // Update viewBox
  svgElement.setAttribute('viewBox', `0 0 ${totalWidth} 4`)
  
  // Calculate peak Y position based on bump height
  // Peak goes up (negative Y) from baseline
  const peakY = baselineY - bumpHeight
  
  // Center of the curve (peak center) - positioned based on bumpPosition (0-100%)
  const peakCenterX = (bumpPosition / 100) * totalWidth
  
  // Position the curve section around the peak center
  const curveStartX = peakCenterX - (curveSectionWidthNum / 2)
  const curveEndX = peakCenterX + (curveSectionWidthNum / 2)
  
  // Calculate maximum extension needed to prevent cut-offs
  // Use half the curve section width as padding on each side
  const maxExtension = curveSectionWidthNum / 2
  
  // Calculate peak control points symmetrically around center
  const halfPeakWidth = curveTopWidthNum / 2
  const centralControlX = peakCenterX - halfPeakWidth  // Left peak control
  const rightControl1X = peakCenterX + halfPeakWidth   // Right peak control
  
  // Curve meeting point stays at center
  const curveMidX = peakCenterX
  
  // Keep the curve control points relative to curve start/end
  const leftControlX = curveStartX + 33  // 110 - 77 = 33
  const centralControlY = peakY  // Use bumpHeight to control peak
  const curveMidY = peakY  // Same as centralControlY
  const rightControl2X = curveEndX - 33  // 227 - 194 = 33, so 194 = 227 - 33
  
  // Extend path beyond viewBox to prevent cut-offs
  const pathStartX = -maxExtension
  const pathEndX = totalWidth + maxExtension
  
  // Store path parameters for Y calculation
  pathParams = {
    baselineY,
    pathStartX,
    curveStartX,
    curveEndX,
    pathEndX,
    leftControlX,
    centralControlX,
    centralControlY,
    curveMidX,
    curveMidY,
    rightControl1X,
    rightControl2X
  }
  
  // Build the path: extended straight -> curve -> extended straight
  const pathData = `M ${pathStartX} ${baselineY} L ${curveStartX} ${baselineY} C ${leftControlX} ${baselineY} ${centralControlX} ${centralControlY} ${curveMidX} ${curveMidY} C ${rightControl1X} ${curveMidY} ${rightControl2X} ${baselineY} ${curveEndX} ${baselineY} L ${pathEndX} ${baselineY}`
  
  gsap.to(pathElement, {
    attr: {
      d: pathData
    }
  })

  // Update marker positions
  updateMarkers()
}

// Function to update marker positions
const updateMarkers = () => {
  const markers = document.querySelectorAll('.slider svg .indicator')
  const { viewBoxWidth } = config
  
  markers.forEach(marker => {
    const cxValue = marker.getAttribute('cx')
    const percent = parseFloat(cxValue) / 100
    const x = percent * viewBoxWidth
    const y = getYPositionAtX(x)
    
    gsap.to(marker, {
      attr: {
        cy: y,
        y: y
      },
    })
  })
}

// Update path when controls change
pathCtrl.on('change', () => updatePath())

// make tweakpane panel draggable
const tweakClass = 'div.tp-dfwv'
const d = Draggable.create(tweakClass, {
  type: 'x,y',
  allowEventDefault: true,
  trigger: tweakClass + ' button.tp-rotv_b',
})
document.querySelector(tweakClass).addEventListener('dblclick', () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: 'all' })
    },
  })
})

const controller = document.getElementById('controller')
controller.value = gsap.utils.random(0, 100, 1)

// Cache symbol elements
const symbolElements = {
  triangle: document.querySelector('.marker-symbol--triangle'),
  square: document.querySelector('.marker-symbol--square'),
  circle: document.querySelector('.marker-symbol--circle'),
  star: document.querySelector('.marker-symbol--star'),
}

// Helper to get active symbol selector based on value
const getActiveSymbol = (value) => {
  if (value >= 0 && value <= 24) return symbolElements.triangle
  if (value >= 25 && value <= 49) return symbolElements.square
  if (value >= 50 && value <= 74) return symbolElements.circle
  if (value >= 75 && value <= 100) return symbolElements.star
  return null
}

gsap.defaults({
  duration: 0,
})
const onUpdate = () => {
  const value = controller.value
  gsap.to('.marker', {
    x: `${config.viewBoxWidth * (value / 100)}px`,
  })
  gsap.to('#track-bounds rect', {
    scaleX: value / 100,
  })
  updatePath(value)
  
  // Update active marker symbol
  Object.values(symbolElements).forEach(symbol => {
    if (symbol) symbol.removeAttribute('data-active')
  })
  
  const activeSymbol = getActiveSymbol(value)
  if (activeSymbol) {
    activeSymbol.setAttribute('data-active', 'true')
  }
}

controller.addEventListener('input', onUpdate)
onUpdate()
updatePath(controller.value, 0)

const activate = () => {
  gsap.to('.marker', {
    y: `-${config.bumpHeight}px`
  })
  updatePath(controller.value, config.bumpHeight)
}
const deactivate = () => {
  updatePath(controller.value, 0)
  gsap.to('.marker', {
    y: 0
  })
}

controller.addEventListener('pointerdown', activate)
controller.addEventListener('pointerup', deactivate)
controller.addEventListener('touchend', deactivate)
controller.addEventListener('focus', activate)
controller.addEventListener('blur', deactivate)

gsap.to('.slider', {
  opacity: 1,
  delay: 0.25,
  ease: 'power2.out',
  duration: 1,
})

gsap.defaults({
  duration: 0.15,
})