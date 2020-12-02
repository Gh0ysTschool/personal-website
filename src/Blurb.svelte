<script>
    export let title = 'Bradley Pudsey'
    export let secondaryColor = false
    export let longFormContent = false
    let primaryColor = !secondaryColor

</script>

<style>
.blurb {
    margin: 2em 3em 2em 3em;
    display: grid;
    grid-template-rows: 2em 16em;
    grid-gap: 1em;
}
.longFormContent {
    grid-template-rows: 2em 76vh 2em;
}
.longFormContent > .content {
    display: unset;
}
.blurb > div {
    display: grid;
    justify-content: center;
    align-content: center;
}
.blurbtitle {
    padding: 1em 4em 1em 4em;
}
.primaryColor {
    background: var(--clr2);
}

.secondaryColor {
    background: var(--clr3);
}
.content {
    padding: 2em;
    overflow: scroll;
    margin-bottom: 4em;
}
</style>

<div class='blurb' class:longFormContent>
    <div class='blurbtitle' class:primaryColor class:secondaryColor>{title}</div>
    <div class='content' class:primaryColor class:secondaryColor>
        <slot></slot>
    </div>
    <div></div>
</div>