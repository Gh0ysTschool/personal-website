<script>
</script>

<style>
.navgrid {
    display: grid;
    grid-template-rows: 6em auto;
    background: var(--clr0);
    font-family: 'Montserrat',arial;
}
.navgrid > div {
    position: relative;
    background: var(--clr1);
    display: grid;
    align-content: center;
    justify-content: center;
    grid-template-columns: 95%;
}
.title {
    background:var(--clr2);
    padding: 1em 4em 1em 4em;
    text-align: center;
}
</style>

<div class='navgrid'>
    <div>
        <div class='title'>Bradley Pudsey</div>
    </div>
    <slot></slot>
</div>