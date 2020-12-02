<script>
    import NavBar from './NavBar.svelte'
    import Stats from './Stats.svelte'
    import Modal from './Modal.svelte'
    import ModalToggle from './ModalToggle.svelte'
    import ValueProposition from './ValueProposition.svelte'
    import Card from './Card.svelte'
</script>
 
<style>
.grid, .grid2 {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-gap: 1em;
    width: 100%;
}
.grid > div, .grid2 > div {
    position: relative;
    width: 10em;
    height: 10em;
}
.grid > div::after, .grid2 > div::after {
    position: absolute;
    content: 'content';
}
@media (orientation: landscape) {
    .orientation {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 1em;
    }
    .grid2 {
        max-height: 80vh;
        overflow: scroll;
        grid-gap: 0;
    }
}
</style>
<NavBar>
    <div class='orientation'>
        <div class='grid'>
            <Stats></Stats>
            <ValueProposition></ValueProposition>
        </div>
        
        <div class='grid2'>
            <Card title="test">test tes t test tstsetse </Card>
            <Card secondaryColor=true></Card><Card></Card>
            <Card secondaryColor=true></Card><Card></Card>
            <Card secondaryColor=true></Card><Card></Card>
            <Card secondaryColor=true></Card>
        </div>
    </div>
    <Modal></Modal>
</NavBar>