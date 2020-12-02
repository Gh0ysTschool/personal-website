<script>
</script>

<style>
ul {
    list-style: none;
    width: 100%;
    margin-top: 0;
    padding-left:1em;
    padding-right:1em;
}
ul > li{
    height: 1em;
    position: relative;
    background: var(--clr0);
    margin-top: 2em;
    margin-bottom: 2em;
}
.header1, .header2 {
    display: grid;
    grid-template-rows: 1.5em auto;
    background: var(--clr1);
    margin-block-end:1em;
    margin-block-start:1em;
    padding-top: 2em; 
    position: relative;
}
.arrow-up, .arrow-down {
    position: absolute;
    height: 3em;
    width: 2em;
    border-radius: 0;
    z-index: 2;
}
.arrow-up::after, .arrow-down::after {
    position: absolute;
    content: '';
    height: 3em;
    width: 3em;
    border-radius: 0;
    z-index: 2;
    background:white;
    left: -0.5em;
}
.arrow-down::after {
    clip-path: polygon(100% 0, 100% 66%, 50% 100%, 0 66%, 0 0);
    background: linear-gradient( 0deg, var(--clr2), var(--clr2) 1em, transparent 1em, transparent 3em); 
}
.arrow-up::after {
    clip-path: polygon(50% 0%, 100% 33%, 100% 100%, 0 100%, 0 33%);
    background: linear-gradient( 0deg, transparent, transparent 2em, var(--clr3) 2em, var(--clr3) 3em); 
}

.arrow-up {
    background: linear-gradient( 0deg, var(--clr3), var(--clr3) 2em, transparent 2em, transparent 3em); 
    top: -2.8em;
    left: 20%;
}

.arrow-down {
    background: linear-gradient( 0deg, transparent, transparent 1em, var(--clr2) 1em, var(--clr2) 3em); 
    bottom: -2.8em;
    left: 40%;

}
span {
    width: 70%;
    height: 1em;
    margin: 0 15% 0 15%;
    background: var(--clr0);
}
.box1, .box2 {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    justify-content: stretch;
    padding-left: 1em;
    padding-right: 1em;
}
.header1 {
    background: radial-gradient(circle at -1em -1em, var(--clr1) 0, var(--clr1) 60%, transparent 60%, transparent), var(--clr2);
}
.header2 {
    background: radial-gradient(circle at 100% 100%, var(--clr1) 0, var(--clr1) 60%, transparent 60%, transparent), var(--clr3);
}
</style>
<div>
    <div class='header1'>
        <span></span>
        <div class='box1'>
            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>

            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
        <div class='arrow-down'></div>
        <div class='arrow-down' style='left:80%'></div>
    </div>
    <div class='header2'>
        <span></span>
        <div class='box2'>
            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>

            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
        <div class='arrow-up'></div>
        <div class='arrow-up' style='left:60%'></div>
    </div>
</div>