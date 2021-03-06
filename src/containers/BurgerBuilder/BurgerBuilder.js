import React, {
	useCallback,
	// Component,
	useEffect,
	useState,
} from "react";
import {
	/* connect,  */
	useDispatch,
	useSelector,
} from "react-redux";

import Aux from "../../hoc/Aux/Aux";
import Burger from "../../components/Burger/Burger";
import BuildControls from "../../components/Burger/BuildControls/BuildControls";
import Modal from "../../components/UI/Modal/Modal";
import OrderSummary from "../../components/Burger/OrderSummary/OrderSummary";
import Spinner from "../../components/UI/Spinner/Spinner";
import withErrorHandler from "../../hoc/withErrorHandler/withErrorHandler";
import * as actions from "../../store/actions/index";
import axios from "../../axios-orders";

const BurgerBuilder = (props) => {
	// constructor(props) {
	//     super(props);
	//     state = {...}
	// }
	const [state, setState] = useState({
		purchasing: false,
	});

	// react redux useSelector()
	const ings = useSelector((state) => {
		return state.burgerBuilder.ingredients;
	});

	const price = useSelector((state) => {
		return state.burgerBuilder.totalPrice;
	});

	const error = useSelector((state) => {
		return state.burgerBuilder.error;
	});

	const isAuthenticated = useSelector((state) => {
		return state.auth.token !== null;
	});

	// react redux useDispatch
	const dispatch = useDispatch();

	const onIngredientAdded = (ingName) =>
		dispatch(actions.addIngredient(ingName));
	const onIngredientRemoved = (ingName) =>
		dispatch(actions.removeIngredient(ingName));

	const onInitIngredients = useCallback(
		() => dispatch(actions.initIngredients()),
		[dispatch]
	);
	const onInitPurchase = () => dispatch(actions.purchaseInit());
	const onSetAuthRedirectPath = (path) =>
		dispatch(actions.setAuthRedirectPath(path));

	useEffect(() => {
		onInitIngredients();
	}, [onInitIngredients]);

	const updatePurchaseState = (ingredients) => {
		const sum = Object.keys(ingredients)
			.map((igKey) => {
				return ingredients[igKey];
			})
			.reduce((sum, el) => {
				return sum + el;
			}, 0);
		return sum > 0;
	};

	const purchaseHandler = () => {
		if (isAuthenticated) {
			setState({ purchasing: true }); /* show modal */
		} else {
			onSetAuthRedirectPath(
				"/checkout"
			); /* IF authenticated in Auth.js - redirect to checkout! */
			props.history.push("/auth"); /* this is what pushes to /auth */
		}
	};

	const purchaseCancelHandler = () => {
		setState({ purchasing: false });
	};

	const purchaseContinueHandler = () => {
		onInitPurchase();
		props.history.push("/checkout");
	};

	const disabledInfo = {
		...ings,
	};
	for (let key in disabledInfo) {
		disabledInfo[key] = disabledInfo[key] <= 0;
	}
	let orderSummary = null;
	let burger = error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

	if (ings) {
		burger = (
			<Aux>
				<Burger ingredients={ings} />
				<BuildControls
					ingredientAdded={onIngredientAdded}
					ingredientRemoved={onIngredientRemoved}
					disabled={disabledInfo}
					purchasable={updatePurchaseState(ings)}
					ordered={purchaseHandler}
					isAuth={isAuthenticated}
					price={price}
				/>
			</Aux>
		);
		orderSummary = (
			<OrderSummary
				ingredients={ings}
				price={price}
				purchaseCancelled={purchaseCancelHandler}
				purchaseContinued={purchaseContinueHandler}
			/>
		);
	}
	// {salad: true, meat: false, ...}
	return (
		<Aux>
			<Modal show={state.purchasing} modalClosed={purchaseCancelHandler}>
				{orderSummary}
			</Modal>
			{burger}
		</Aux>
	);
};

/* const mapStateToProps = (state) => {
	return {};
};

const mapDispatchToProps = (dispatch) => {
	return {};
}; */

export default /* connect(
	mapStateToProps,
	mapDispatchToProps
) */ withErrorHandler(
	BurgerBuilder,
	axios
);
