let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
let vector = new THREE.Vector3()
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let geometry = new THREE.BoxGeometry(1, 1, 1)
let material = new THREE.MeshBasicMaterial({ 
    color: "rgb(3, 197,221)",
    wireframe: true,
    wireframeLinewidth: 1
})
let cube = new THREE.Mesh(geometry, material)
scene.add(cube)

camera.position.z = 5

const video = document.getElementById("myvideo")
const handimg = document.getElementById("handimage")
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
let trackButton = document.getElementById("trackbutton")
let updateNote = document.getElementById("updatenote")

let imgindex = 1
let isVideo = false
let model = null

const modelParams = {
    flipHorizontal: true,
    maxNumBox: 1,
    iouThreshold: 0.5,
    scoreThreshold: 0.7
}

handTrack.load(modelParams).then(lmodel => {
    model = lmodel
    updateNote.innetText = "Loaded Model!"
    trackButton.disabled = false
})

startVideo = () => {
    handTrack.startVideo(video).then(status => {
        if(status) {
            updateNote.innerText = "Video Started. Now Tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    })
}

toggleVideo = () => {
    if(!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo()
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false
        updateNote.innerText = "Video stopped"
    }
}

runDetection = () => {
    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video)
        if(isVideo) {
            requestAnimationFrame(runDetection)
        }
        if(predictions.length > 0) {
            changeData(predictions[0].bbox)
        }
    })
}

changeData = value => {
    let midvalX = value[0] + value[2] / 2
    let midvalY = value[1] + value[3] / 2

    document.querySelector(".hand-1 #hand-x span").innerHtml = midvalX
    document.querySelector(".hand-1 #hand-y span").innerHtml = midvalY

    moveTheBox({ x: (midvalX - 300) / 600, y: (midvalY - 250) / 500 })
}

moveTheBox = value => {
    cube.position.x = ((window.innerWidth * value.x) / window.innerWidth) * 6
    cube.position.y = -((window.innerHeight * value.y) / window.innerHeight) * 6
    renderer.render(scene, camera)
}

const animate = () => {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
}

animate()