import '../scss/league.scss';

import EDIT_ICON from '../assets/edit.svg';


export class LeagueView {

    private root:HTMLDivElement;

    constructor(parentElement:HTMLDivElement) {
        this.build(parentElement);
    }

    build(parentElement:HTMLDivElement): void {
        this.root = document.createElement('div');
        this.root.classList.add('league');

        const leagueName = this.createEditRow('league-name', 'League Name');
        this.root.appendChild(leagueName);

        this.root.addEventListener('change', e=> {
            if((e.target as HTMLElement).dataset.type == 'league-name') {
                (e.target as HTMLElement).nextElementSibling.classList.remove('hidden');
                const div = this.createEditRow('team', 'Team Name');
                this.root.appendChild(div);
            }
            else {
                this.refreshButtons();
            }
        });

        parentElement.appendChild(this.root);
    }

    private createEditRow(type:string, placeholder:string): HTMLDivElement {
        const div = document.createElement('div');
        div.classList.add(type, 'edit-row');

        const input = document.createElement('input');
        input.placeholder = placeholder;
        input.dataset.type = type;

        const edit = document.createElement('button');
        edit.classList.add('btn', 'btn-circle', 'hidden');
        const editIcon = document.createElement('img');
        editIcon.alt = 'Edit';
        editIcon.src = EDIT_ICON;
        edit.appendChild(editIcon);

        div.appendChild(input);
        div.appendChild(edit);

        return div;
    }

    private refreshButtons(): void {
        //if all inputs are full, add a new one
        let emptyInputs:HTMLElement[] = [];
        for(let team of this.root.getElementsByClassName('team')) {
            const input = team.querySelector('input');
            if(input.value) {
                input.nextElementSibling.classList.remove('hidden');
            }
            else {
                emptyInputs.push(team as HTMLElement);
                input.nextElementSibling.classList.add('hidden');
            }
        }
        if(emptyInputs.length == 0) {
            const div = this.createEditRow('team', 'Team Name');
            this.root.appendChild(div);
            div.focus();
        }
        else if(emptyInputs.length > 1) {
            //remove all but last
            for(let i = 0; i < emptyInputs.length-1; ++i) {
                emptyInputs[i].remove();
            }
        }
    }
}