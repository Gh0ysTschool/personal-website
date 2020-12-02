<script>
    import {onMount} from 'svelte'
    let modal =  document.createElement('div')
    let toggle = () =>{
        modal.classList.add('hiddenModal')
        modal.classList.remove('visibleModal')
    }
    onMount(()=>{
        if(document.querySelector('.modal'))
            modal =  document.querySelector('.modal')
        toggle()
    })
</script>

<style>
    .modal-toggle {
        height: 2em;
        width: 2em;
        background: var(--clr2);
        position: absolute;
        right: 1em;
        top: 1em;
        z-index: 11;
        display: grid;
        align-content: center;
        justify-content: center;
    }
</style>

<div class='modal-toggle' on:click={toggle}>
    X
</div>
<div class='visibleModal hiddenModal'></div>