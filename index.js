console.log(gsap)
const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const x = canvas.width/2;
const y = canvas.height/2;

const scoreEl = document.querySelector("#scoreEl")
const startGameBtn = document.querySelector("#startGameBtn")

const removeEl = document.querySelector("#removeEl")
const bigScoreEl = document.querySelector("#bigScoreEl")

class Player{
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 
            , Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Projectile{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 
            , Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 
            , Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1 
        //to make particle fade away over time
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 
            , Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// const projectile =  new Projectile(canvas.width/2, canvas.height/2, 4 , 'yellow', 
//  {
//      x: 1,
//      y: 1
//  })

// console.log(player);

let player = new Player(x , y , 12 , 'purple')
let projectiles = []
let enemies = []
let particles = []

//to restart the gameplay loop 
function init(){
    player = new Player(x , y , 12 , 'purple')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random() * (30 - 5) + 5

        let x 
        let y 

        //screen of spawining
        if(Math.random()<0.5){

            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius  
            y = Math.random() * canvas.height
        }else{
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius  
            x = Math.random() * canvas.width
        }

        const color = `hsl(${Math.random() * 360} 80% 50%)`
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x) 

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity))
        
    }, 1200)
}

let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //ctx.clearRect(0, 0, canvas.width, canvas.height) changing it to fillRect to add color; set opacity to 0.1 ; gives a fade effect of rect overlapping 
    player.draw()  
    particles.forEach((particle, index) =>{
        if(particle.alpha <= 0.2){
            particles.splice(index , 1)
        }else{
        particle.update()
        }
    })
    projectiles.forEach((projctile, index)=>{
        projctile.update()

        //removing projectiles from screen i.e, stopping projectile animation once they hit the windows end L to R(0 to canvas.width) and from T to B
        if(projctile.x < 0 || projctile.x > canvas.width || projctile.y < 0 || projctile.y > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0);
        }
    })  
    
    enemies.forEach((enemy, index)=>{
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        //end game
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            //stops the animation frame
            removeEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile , projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            //collision detected
            if(dist - enemy.radius - projectile.radius < 1){
                
                for (let i = 0; i < enemy.radius * 1.3; i++) {
                    //creating explosions
                    particles.push(
                        new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, 
                            {x: (Math.random()-0.5) * (Math.random() * 5), y: (Math.random()-0.5) * (Math.random() * 5)}
                        )
                    )
                }

                if(enemy.radius - 10 > 7){
                        //increase score
                        score += 100
                        scoreEl.innerHTML = score
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                            projectiles.splice(projectileIndex, 1)
                        }, 0);
                }else{
                    setTimeout(() => {
                        //increase score for removing at one shot
                        score += 150
                        scoreEl.innerHTML = score
                        //to remove the flash effect caused by constantly calling draw() in animation
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }   
            }
        });
    })
}

window.addEventListener('click', (event)=>
    {   
        console.log(projectiles)
        const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2)  //op is in radian 360* = 3.14 rad

        const velocity = {
            x: Math.cos(angle) *5,
            y: Math.sin(angle) *5
        }

        projectiles.push(new Projectile(
            canvas.width/2 , canvas.height/2 , 5 ,
            'purple', velocity)
        )
    })

startGameBtn.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemies()
    removeEl.style.display = 'none'
})


