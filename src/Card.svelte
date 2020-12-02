<script>
    import Blurb from './Blurb.svelte'
    export let secondaryColor = false
    export let title = 'Bradley Pudsey'
    let primaryColor = !secondaryColor
    let clickhandler = ()=> {
        [...document.querySelectorAll('.modal')].map(el=>{
            el.classList.remove('hiddenModal')
            el.classList.add('visibleModal')
        })
    }
</script>

<style>

.header11 {
    height: 22em;
    display: grid;
    grid-template-rows: 1.5em auto;
    background: var(--clr1);
    grid-column: 3 / 1;
    position: relative;
    overflow: hidden;
    margin-top: 1em;
}
.primaryColor {
    background: var(--clr3);
}

.secondaryColor {
    background: var(--clr2);
}

.headerbg {
    border-radius:  55% 1em 55% 1em / 33% 1em 33% 1em;
    min-width: 100%;
    min-height: 22em;
    background: var(--clr1);
    background-position: center;
    transition: background 0.8s;
}
.headerbg:hover {
  background: var(--clr1) radial-gradient(circle, transparent 1%, var(--clr1) 1%) center/15000%;
}
.headerbg:active {
  background-color: var(--clr3);
  background-size: 100%;
  transition: background 0s;
}
</style>
    <div class='header11' class:primaryColor class:secondaryColor on:click={clickhandler}>
        <div class='headerbg'></div>
        <Blurb {title} {secondaryColor}>
            <slot></slot>
        </Blurb>
    </div>