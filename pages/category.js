import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import RecipeCard from "../components/RecipeCard";
import CustomizedPaginate from "../components/CustomizedPaginate";
import { GET_ALL_RECIPE, GET_CATEGORY_RECIPE } from "../_axios/recipe";
import { useRouter } from "next/router";

const Category = () => {
  const router = useRouter();
  const categoryName = router.query.categoryName;
  const [recipes, setRecipes] = useState([]);
  const [recipesCount, setRecipesCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getCategorizedRecipe = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { access, recipesCount, totalPages, recipes },
      } = await GET_CATEGORY_RECIPE(page, 8, categoryName);

      if (access) {
        setRecipes(recipes);
        setRecipesCount(recipesCount);
        setPageCount(totalPages);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [categoryName, page]);

  const getRecipeAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { access, recipesCount, totalPages, recipes },
      } = await GET_ALL_RECIPE(page, 8);

      if (access) {
        setRecipes(recipes);
        setRecipesCount(recipesCount);
        setPageCount(totalPages);
      }
    } catch(error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [page]);

  useEffect(() => {
    if (categoryName === "ALL") {
      getRecipeAll();
    } else {
      getCategorizedRecipe();
    }
  }, [getRecipeAll, getCategorizedRecipe, categoryName]);

  return (
    <>
      <Head>
        <title>STARVING | {categoryName}</title>
      </Head>
      <Layout>
        {isLoading ?
        <Loading />
        :
        <div className="w-full min-h-screen bg-slate-50">
          <section className="w-[1060px] space-y-8 py-16 mx-auto">
            <p className="text-2xl font-bold text-cyan-600">#{categoryName}</p>
            <p className="text-3xl font-bold">
              ????????? ?????? ????????????{" "}
              <span className="text-cyan-600">{recipesCount}</span>??? ????????????.
            </p>
            <article className="w-[1060px] grid grid-rows-2 grid-cols-4 mx-auto my-4">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.pk}
                  pk={recipe.pk}
                  nickname={recipe.owner.nickname}
                  desc={recipe.description}
                  title={recipe.title}
                  likesCount={recipe.likesCount}
                  avatarImage={recipe.owner.avatarImage}
                  cookImages={recipe.cookImages}
                />
              ))}
            </article>
            <CustomizedPaginate setPage={setPage} pageCount={pageCount} pageRangeDisplayed={10}/>
          </section>
        </div>
        }
      </Layout>
    </>
  );
};

export default Category;
