/* ========================================================================== *\
	PUBLIC API
\* ========================================================================== */
export class Action<T> {
	/* ======================================================================= *\
		CONSTRUCTOR
	\* ====================================================================== */
	constructor(detail?: T, cancelable: boolean = false) {
		this._cancelable = cancelable;
		this._detail = detail ?? undefined;
	}



	/* ====================================================================== *\
		INSTANCE PROPERTIES
	\* ====================================================================== */
	private _cancelable: boolean;
	private _defaultPrevented: boolean = false;
	private _detail: T|undefined;

	/* ---------------------------------- *\
		cancellable
	\* ---------------------------------- */
	/**
	 * Indicates whether or not the issue can be cancelled.
	 *
	 * @readonly
	 * @memberof Issue
	 */
	public get cancelable(): boolean {
		return this._cancelable;
	}

	/* ---------------------------------- *\
		defaultPrevented
	\* ---------------------------------- */
	/**
	 * Indicates whether or not the preventDefault method has been called on a
	 * cancellable issue.
	 *
	 * @readonly
	 * @memberof Issue
	 */
	public get defaultPrevented(): boolean { return this._defaultPrevented; }

	/* ---------------------------------- *\
		detail
	\* ---------------------------------- */
	/**
	 * The payload of the issue as provided during the creation of the issue.
	 *
	 * @readonly
	 * @memberof Issue
	 */
	public get detail(): T|undefined {
		return this._detail;
	}



	/* ====================================================================== *\
		PUBLIC METHODS
	\* ====================================================================== */
	/**
	 * Informs the publisher of the issue that whatever action it was about to
	 * perform should in fact not be performed.
	 * Calling this method on an issue where cancelable is not true has
	 * no effect.
	 *
	 * @memberof Issue
	 */
	preventDefault(): void {
		this._defaultPrevented = this.cancelable;
	}
}
