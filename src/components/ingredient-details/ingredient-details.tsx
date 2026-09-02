import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import {
  selectIngredientById,
  selectIngredients,
  selectIngredientsError
} from '@selectors';
import { useSelector } from '../../services/store';

const INGREDIENT_NOT_FOUND_TEXT = 'Ингредиент не найден';

export const IngredientDetails: FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const ingredients = useSelector(selectIngredients);
  const ingredientsError = useSelector(selectIngredientsError);
  const ingredientData = useSelector((state) =>
    selectIngredientById(state, id)
  );

  if (!ingredientData) {
    const isIngredientMissing = ingredients.length > 0;
    const message = ingredientsError
      ? ingredientsError
      : isIngredientMissing
        ? INGREDIENT_NOT_FOUND_TEXT
        : null;
    return message ? (
      <p className='text text_type_main-default'>{message}</p>
    ) : (
      <Preloader />
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
