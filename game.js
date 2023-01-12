var canvas = document.getElementById('game');
var c = canvas.getContext('2d');

var cache = [];

const pkmnScale = 1; //image pixels per ingame pixels
var canvasScale = 3; //canvas pixels per ingame pixels

var unrenderedItem = false;

class Pokemon {
    get maxHP() {
        var Base = this.base[5];
        var IV = this.IV['HP'];
        var EV = Math.floor(this.EV['HP'] / 4);
        var Lvl = this.level;

        return Math.floor( ( 2*Base + IV + EV ) * Lvl / 100 ) + Lvl + 10;
    }
    constructor(type, level, gender, isUser, EV, IV) {
        this.type = type;
        this.level = level;
        this.gender = gender;
        if(type == 29 || type == 32)
            this.gender = '';

        this.isUser = isUser;

        this.EV = EV;
        this.IV = IV;
        this.base = pkmnData[type];

        this.HP = this.maxHP;

        if(isUser) {
            this.img = backView(type);
            this.x = 40;
            this.y = 112;
        } else {
            this.img = frontView(type);
            this.x = 144;
            this.y = 72;
        }

        this.name = pkmnList[type-1];
    }


    render(vOffset=0) {
        Render(this.img, this.x, this.y + vOffset, 1);
    }
}



/*var playerMon= new Pokemon(1, 22, '>', true);
var enemyMon = new Pokemon(2, 22, '<', false);*/

var nameText = new Image();
var battleText = new Image();
nameText.src = 'nameText.png';
battleText.src = 'battleText.png';


function resize(newScale) {
    canvasScale = newScale;
    canvas.width = canvasScale * 240;
    canvas.height = canvasScale * 160;
    c.imageSmoothingEnabled = false;
}

resize(canvasScale);

function loadAssets() {
    assets = ['bkg.png', 'playerHP.png', 'enemyHP.png'];
    for (i = 0; i < assets.length; i++) {
        cache[assets[i]] = new Image();
        cache[assets[i]].src = assets[i];
    }
}

function Render(path, x, y, scale) {
    if(!cache[path]) {
        cache[path] = new Image();
        cache[path].onload = function() {
            w = cache[path].width / scale;
            h = cache[path].height / scale;

            screen_x = x * canvasScale;
            screen_y = (y - h) * canvasScale; //jumps to 112

            c.drawImage(cache[path], screen_x, screen_y, w*canvasScale, h*canvasScale);
        }
        cache[path].src = path;
    }
    else {
        w = cache[path].width / scale;
        h = cache[path].height / scale;

        screen_x = x * canvasScale;
        screen_y = (y - h) * canvasScale; //jumps to 112

        c.drawImage(cache[path], screen_x, screen_y, w*canvasScale, h*canvasScale);
    }

}


function frontView(dexNum) {
    return 'front/' + dexNum + '.png';
}

function backView(dexNum) {
    return 'back/' + dexNum + '.png';
}


function textbox(player, enemy) {
    Render('textbox.png',0,160,5);
    Render('playerHP.png',126,112,1);
    var level = player.level.toString();
    var lshift1 = 0;
    var lshift2 = 0;
    if(level.length === 2){
        lshift1 = 5;
        lshift2 = 5;
    }
    if(level.length === 3) {
        lshift1 = 10;
        lshift2 = 11;
    }

    renderNameText(player.name + player.gender, 142, 78);
    c.drawImage(nameText, 532, 0, 9, 11, (208-lshift1) * canvasScale, 78 * canvasScale, 9 * canvasScale, 11 * canvasScale);
    renderNameText(level, (216-lshift2), 78);

    Render('enemyHP.png',15,45,1);
    level = enemy.level.toString();
    var lshift1 = 0;
    var lshift2 = 0;
    if(level.length === 2){
        lshift1 = 5;
        lshift2 = 5;
    }
    if(level.length === 3) {
        lshift1 = 10;
        lshift2 = 11;
    }
    renderNameText(enemy.name + enemy.gender, 23, 19);
    c.drawImage(nameText, 532, 0, 9, 11, (88-lshift1) * canvasScale, 19 * canvasScale, 9 * canvasScale, 11 * canvasScale);
    renderNameText(level, (97-lshift2), 19);
    var hpmod = player.HP.toString().padStart(3, ' ') + '/' + player.maxHP.toString().padStart(3, ' ');
    console.log(hpmod);
    renderNameText(hpmod, 186, 96);

}

function background() {
    Render('bkg.png',0,112,5);
}

function scene() {
    background();
    playerMon.render();
    enemyMon.render();
    textbox(playerMon, enemyMon);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomScene() {
    EV = {HP: 74, Atk: 190, Def: 91, SAtk: 48, SDef: 84, Speed: 23};
    IV = {HP: 24, Atk: 12, Def: 30, SAtk: 16, SDef: 23, Speed: 16};

    playerMon = new Pokemon(randInt(1,152), randInt(1,101), '<>'[randInt(0,2)], true, EV, IV);
    enemyMon = new Pokemon(randInt(1,152), 100, '<>'[randInt(0,2)], false, EV, IV);

    scene();
    battleMessage('Wild ' + enemyMon.name + ' appeared!');
}

function keyInput(event) {
    console.log(event);
    if(event.key == 'r') {
        clearInterval(scroll);
        randomScene();

    }
    if(event.key == 'u') {
        resize(canvasScale + 0.1);
        scene();
    }
    if(event.key == 'd') {
        resize(canvasScale - 0.1);
        scene();
    }
}

const NAME_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.,abcdefghijklmnopqrstuvwxyz0123456789!?=+/-_()[]<>';

function nameTextPos(letter) {
    var naive_pos = NAME_ALPHABET.indexOf(letter) * 7;
    var pos = naive_pos;

    // correct for I, T, Y, p, ! (4 pixels) and i (3 pixels)
    if(naive_pos > 56)
        pos = pos - 1;
    if(naive_pos > 133)
        pos = pos - 1;
    if(naive_pos > 168)
        pos = pos - 1;
    if(naive_pos > 252)
        pos = pos - 2;
    if(naive_pos > 301)
        pos = pos - 1;
    if(naive_pos > 455)
        pos = pos - 1;

    return pos;
}

const BATTLE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.-';

function battleTextPos(letter) {
    var naive_pos = BATTLE_ALPHABET.indexOf(letter) * 6;
    var pos = naive_pos;

    // correct for f,k,n,r,s,t (5 pixels) and i,l (4 pixels)
    const oneless = ['f','k','n','r','s','t','l'];
    const twoless = ['i'];

    function correct(item) {
        if(naive_pos > BATTLE_ALPHABET.indexOf(item) * 6) {
            pos = pos - 1
        }
    }

    oneless.forEach(
        correct
    );
    twoless.forEach(
        correct
    );
    twoless.forEach(
        correct
    );

    return pos;
}

function renderNameText(text,x,y) {
    var xPos = x;
    for (i = 0; i < text.length; i++) {
        if(text[i] == ' ') {
            xPos += 5;
            continue;
        }
        var letterSize = 5;
        if(text[i] == 'I' || text[i] == 'T' || text[i] == 'Y')
            letterSize = 4;
        if(text[i] == 'i')
            letterSize = 3;

        c.drawImage(nameText, nameTextPos(text[i]), 0, letterSize, 11, xPos * canvasScale, y * canvasScale, letterSize * canvasScale, 11 * canvasScale);
        xPos += letterSize;

    }
}

function renderBattleText(text,x,y) {
    var xPos = x;
    var yPos = y;

    const oneless = 'fknrstl';
    const twoless = 'i';

    var i = 0;
    scroll = setInterval(function(){
        if (i >= text.length)
            clearInterval(scroll);

        if (text[i] == '\n') {
            xPos = x;
            yPos += 16;
            i += 1;
            return;
        }

        var letterSize = 6;
        if(oneless.includes(text[i]))
            letterSize = 5;
        if(twoless.includes(text[i]))
            letterSize = 4;

        c.drawImage(battleText, battleTextPos(text[i]), 0, letterSize, 16, xPos * canvasScale, yPos * canvasScale, letterSize * canvasScale, 16 * canvasScale);
        xPos += letterSize;
        i += 1;
    }, 50);
}

function battleMessage(text) {
    Render('textbox.png',0,160,5);
    renderBattleText(text, 14, 119)
}

document.addEventListener('keypress', keyInput);

loadAssets();
