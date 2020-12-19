<script>
    import Blurb from './Blurb.svelte'
    import ModalToggle from './ModalToggle.svelte'
    export let secondaryColor = false
    export let title = 'Bradley Pudsey'
    export let hiddenModal = false
    export let visibleModal = false
    export let post = {title:'',blurb:''}
    let primaryColor = !secondaryColor
    let longFormContent = true
    
</script>

<style>

.hiddenModal {
    transform: scale(0);
}
.visibleModal {
    transform: scale(1);
}
.modal {
    height: 22em;
    display: grid;
    grid-template-rows: 1.5em auto;
    background: var(--clr1);
    grid-column: 3 / 1;
    position: relative;
    overflow: hidden;
    margin-top: 1em;
    z-index: 10;
    position: fixed;
    width: 90vw;
    height: 90vh;
    margin: auto;
    transition: all 0.5s
}
.primaryColor {
    background: var(--clr3);
}

.secondaryColor {
    background: var(--clr2);
}

.modalbg {
    border-radius:  55% 1em 55% 1em / 33% 1em 33% 1em;
    min-width: 100%;
    min-height: 90vh;
    background: var(--clr1);
    background-position: center;
    transition: background 0.8s;
    overflow: scroll;
}
.modalbg:hover {
  background: var(--clr1) radial-gradient(circle, transparent 1%, var(--clr1) 1%) center/15000%;
}
.modalbg:active {
  background-color: var(--clr3);
  background-size: 100%;
  transition: background 0s;
}
</style>
    <div class='modal' class:primaryColor class:secondaryColor class:hiddenModal class:visibleModal>
        <div class='modalbg'></div>
        <Blurb title={post.title} {secondaryColor} {longFormContent}>
            {post.blurb}
            <slot></slot>
        </Blurb>
            <ModalToggle></ModalToggle>
    </div>
    