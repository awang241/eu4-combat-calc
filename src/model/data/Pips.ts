class Pips {
    private _fireOffence: number;
    private _fireDefence: number;
    private _shockOffence: number;
    private _shockDefence: number;
    private _moraleDefence: number;
    private _moraleOffence: number;

    constructor(fireOffence: number, fireDefence: number, 
        shockOffence: number, shockDefence: number,
        moraleOffence: number, moraleDefence: number) {
        this._fireOffence = fireOffence;
        this._fireDefence = fireDefence;
        this._shockOffence = shockOffence;
        this._shockDefence = shockDefence;
        this._moraleOffence = moraleOffence;
        this._moraleDefence = moraleDefence;
    }

    public get fireOffence(): number {return this._fireOffence;}
    public get fireDefence(): number {return this._fireDefence;}
    public get shockOffence(): number {return this._shockOffence;}
    public get shockDefence(): number {return this._shockDefence;}
    public get moraleOffence(): number {return this._moraleOffence;}
    public get moraleDefence(): number {return this._moraleDefence;}
    
    public defencePips(isFirePhase: boolean): number {
        return isFirePhase ? this.fireDefence: this.shockDefence;
    }

    public offencePips(isFirePhase: boolean): number {
        return isFirePhase ? this.fireOffence: this.shockOffence;
    }
}

export default Pips