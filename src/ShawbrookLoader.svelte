<script>

</script>
<style>
    .shawbrook-loader {
        width: 7rem;
        height: 4rem;
        display: flex;
        justify-content: center;
        background: linear-gradient(40deg,var(--clr0), #141414);
        box-shadow: black 1px 1px;
    }
    .shawbrook-loader-dot:after {   
        content: '';
        position: absolute;
        width: 1rem;
        height: 1rem;
        background: radial-gradient(var(--clr2), var(--clr2) 0.1rem, transparent 0.1rem);
        animation: 1.6s pulse infinite;
    }
    .shawbrook-loader-dot {
        position: absolute;
        transform-origin: bottom;
        width:1rem;
        height: 2rem;
        
    }
    .shawbrook-loader-dot:nth-child(1) {
        animation-delay:calc(2*0.1s);
        transform: rotate(45deg);
    }
    .shawbrook-loader-dot:nth-child(2) {
        animation-delay:calc(2*0.2s);
        transform: rotate(90deg);
    }
    .shawbrook-loader-dot:nth-child(3) {
        animation-delay:calc(2*0.3s);
        transform: rotate(135deg);
    }
    .shawbrook-loader-dot:nth-child(4) {
        animation-delay:calc(2*0.4s);
        transform: rotate(180deg);
    }
    .shawbrook-loader-dot:nth-child(5) {
        animation-delay:calc(2*0.5s);
        transform: rotate(225deg);
    }
    .shawbrook-loader-dot:nth-child(6) {
        animation-delay:calc(2*0.6s);
        transform: rotate(270deg);
    }
    .shawbrook-loader-dot:nth-child(7) {
        animation-delay:calc(2*0.7s);
        transform: rotate(315deg);
    }
    .shawbrook-loader-dot:nth-child(8) {
        animation-delay:calc(2*0.8s);
        transform: rotate(360deg);
    }
    .shawbrook-loader-dot:nth-child(1):after {
        animation-delay:calc(2*0.1s);
    }
    .shawbrook-loader-dot:nth-child(2):after {
        animation-delay:calc(2*0.2s);
    }
    .shawbrook-loader-dot:nth-child(3):after {
        animation-delay:calc(2*0.3s);
    }
    .shawbrook-loader-dot:nth-child(4):after {
        animation-delay:calc(2*0.4s);
    }
    .shawbrook-loader-dot:nth-child(5):after {
        animation-delay:calc(2*0.5s);
    }
    .shawbrook-loader-dot:nth-child(6):after {
        animation-delay:calc(2*0.6s);
    }
    .shawbrook-loader-dot:nth-child(7):after {
        animation-delay:calc(2*0.7s);
    }
    .shawbrook-loader-dot:nth-child(8):after {
        animation-delay:calc(2*0.8s);
    }
    @keyframes pulse{
        0% {transform: scale(1)}
        40% {transform: scale(2.4)}
        100% {transform: scale(1)}
    }
</style>
<div class='shawbrook-loader'>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
    <div class='shawbrook-loader-dot'></div>
</div>