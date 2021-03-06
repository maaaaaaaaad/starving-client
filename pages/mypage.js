import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useRouter } from "next/router";
import { GET_AUTH, DELETE_AUTH } from "../_axios/user";
import { GET_MY_RECIPE } from "../_axios/recipe";
import AvatarImage from "../components/form/AvatarImage";
import Head from "next/head";
import Layout from "../components/Layout";
import NoContent from "../components/NoContent";
import RecipeCard from "../components/RecipeCard";
import UpdataUserForm from "../components/form/UpdateUserForm";
import { useSnackbar } from "notistack";
import Button from "@mui/material/Button";
import CustomizedPaginate from "../components/CustomizedPaginate";
import { GET_MY_LIKE } from "../_axios/like";

const Mypage = () => {
  const router = useRouter();
  const currentUrl = router.asPath;

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarImage, setAvatarImage] = useState("/defaultAvatarImage.png");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isSocial, setIsSocial] = useState(false);

  const [likes, setLikes] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [likePage, setLikePage] = useState(0);

  const getAuth = useCallback(async () => {
    const res = await GET_AUTH();

    if (!res) {
      await router.push(`/login/?returnUrl=${currentUrl}`);
    } else {
      setNickname(res.data.nickname);
      setEmail(res.data.email);
      setAvatarImage(res.data.avatarImage);
      if (res.data.social) {
        setIsSocial(true);
      }
    }
  }, [currentUrl, router]);

  const getMyrecipePage = useCallback(async () => {
    const SIZE = 8;
    try {
      const {
        data: { access, totalPages, recipes },
      } = await GET_MY_RECIPE(page, SIZE);

      if (access) {
        setRecipes(recipes);
        setPageCount(totalPages);
      }
    } catch (err) {
      console.log(err);
    }
  }, [page]);

  const getMyLikeRecipe = useCallback(async () => {
    try {
      const {
        data: { likes, totalCount, totalPages },
      } = await GET_MY_LIKE(page, 8);

      setLikes(likes);
      setLikeCount(totalCount);
      setLikePage(totalPages);
    } catch (e) {
      console.log(e);
    }
  }, [page]);

  useEffect(() => {
    getAuth();
    getMyrecipePage();
    getMyLikeRecipe();
  }, [getAuth, getMyrecipePage, getMyLikeRecipe]);

  const logout = async () => {
    localStorage.removeItem("access_token");
    enqueueSnackbar("????????????", { variant: "info" });
    setTimeout(async () => {
      await router.push(`/login/?returnUrl=${currentUrl}`);
    }, 1000);
  };

  const handleDeleteUser = async () => {
    try {
      const {
        data: { access },
      } = await DELETE_AUTH();

      if (access) {
        localStorage.removeItem("access_token");
        enqueueSnackbar("??????????????? ?????????????????????", { variant: "info" });
        setTimeout(async () => {
          await router.push("/");
        }, 1000);  
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>STARVING | MYPAGE</title>
      </Head>
      <Layout>
        <section className="w-[1060px] mx-auto">
          <section className="mt-20">
            <section className="flex">
              <h2 className="mb-14 text-gray-700 font-semibold text-2xl mr-auto">
                ???????????????
              </h2>
              <article className="space-x-2 text-gray-400">
                <button
                  onClick={() => {
                    const action = (key) => (
                      <Fragment>
                        <Button
                          color="error"
                          onClick={() => {
                            closeSnackbar(key);
                          }}
                        >
                          ??????
                        </Button>
                        <Button color="error" onClick={handleDeleteUser}>
                          ??????
                        </Button>
                      </Fragment>
                    );

                    return enqueueSnackbar("?????????????????????????", {
                      variant: "warning",
                      action,
                    });
                  }}
                >
                  ????????????
                </button>
                <span>|</span>
                <button onClick={logout}>????????????</button>
              </article>
            </section>

            <section className="flex border-solid border-t-2 border-gray-500 bg-sky-50">
              <article className="flex flex-col items-center basis-1/4 px-5 pt-5 pb-12 border-solid border border-gray-200">
                <AvatarImage nickname={nickname} />
              </article>

              <article className="flex flex-col justify-center pl-5 basis-3/4 border-solid border-r border-b border-gray-200">
                <div>
                  <h3 className="text-sm text-blue-400">?????????</h3>
                  <p className="text-gray-700">{nickname}</p>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm text-blue-400">E-mail</h3>
                  <p className="text-gray-700">{email}</p>
                </div>
              </article>
            </section>
          </section>

          {isSocial ? null : (
            <section className="my-20">
              <h2 className="mb-14 text-gray-700 font-semibold text-2xl">
                ??????????????????
              </h2>

              <section className="flex py-6 px-5 border-solid border border-gray-200">
                <article className="w-full">
                  <UpdataUserForm />
                </article>
              </section>
            </section>
          )}

          <section className="my-20">
            <h2 className="mb-14 text-gray-700 font-semibold text-2xl">
              ???????????????
            </h2>

            <section>
              <article>
                {recipes.length !== 0 ? (
                  <div>
                    <div className="grid grid-rows-1 grid-cols-4 my-4">
                      {recipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.pk}
                          pk={recipe.pk}
                          nickname={nickname}
                          desc={recipe.description}
                          title={recipe.title}
                          likesCount={recipe.likesCount}
                          avatarImage={avatarImage}
                          cookImages={recipe.cookImages}
                        />
                      ))}
                    </div>
                    <CustomizedPaginate
                      setPage={setPage}
                      pageCount={pageCount}
                      pageRangeDisplayed={5}
                    />
                  </div>
                ) : (
                  <NoContent text={`?????? ???????????? ???????????? ????????????`} />
                )}
              </article>
            </section>
          </section>

          <section className="my-20">
            <h2 className="mb-14 text-gray-700 font-semibold text-2xl">
              ???????????? ?????????
            </h2>

            <section>
              <article>
                {likes.length !== 0 ? (
                  <div>
                    <div className="grid grid-rows-1 grid-cols-4 my-4">
                      {likes.map((like) => (
                        <RecipeCard
                          key={like.pk}
                          pk={like.recipe.pk}
                          nickname={nickname}
                          desc={like.recipe.description}
                          title={like.recipe.title}
                          likesCount={like.recipe.likesCount}
                          avatarImage={avatarImage}
                          cookImages={like.recipe.cookImages}
                        />
                      ))}
                    </div>
                    <CustomizedPaginate
                      setPage={setPage}
                      pageCount={pageCount}
                      pageRangeDisplayed={5}
                    />
                  </div>
                ) : (
                  <NoContent text={`?????? ???????????? ?????? ???????????? ????????????`} />
                )}
              </article>
            </section>
          </section>
        </section>
      </Layout>
    </>
  );
};

export default Mypage;
