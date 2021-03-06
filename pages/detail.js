import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from "react";
import Head from "next/head";
import { GET_AUTH } from "../_axios/user";
import { GET_ONE_RECIPE, DELETE_RECIPE } from "../_axios/recipe";
import { POST_LIKE, DELETE_LIKE, GET_LIKE } from "../_axios/like";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import Button from "@mui/material/Button";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import CommentArea from "../components/comment/CommentArea";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";

const NO_USER_IMAGE_URL = "/defaultAvatarImage.png";

const Detail = () => {
  const router = useRouter();
  const recipePk = router.query.recipePk;
  
  const [userPk, setUserPk] = useState(0);
  const [recipe, setRecipe] = useState({});
  const [owner, setOwner] = useState({nickname: "", avatarImage: NO_USER_IMAGE_URL});
  const [cookImages, setCookImages] = useState([]);
  const [category, setCategory] = useState("");

  const [isOwner, setIsOwner] = useState(false);
  const [liked, setLiked] = useState(false);

  const [navA, setNavA] = useState(null);
  const [navB, setNavB] = useState(null);
  const slickA = useRef(null);
  const slickB = useRef(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const checkOwner = useCallback(async (ownerPk) => {
    try {
      const {
        data: { pk },
      } = await GET_AUTH();

      if (pk) {
        setUserPk(pk);
        if (pk === ownerPk) setIsOwner(true);
        else setIsOwner(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getRecipeOne = useCallback(async () => {
    try {
      const {
        data: {
          access,
          recipe: {
            title,
            description,
            mainText,
            cookImages,
            updateAt,
            likesCount,
            owner: { pk, nickname, avatarImage },
            category: { values },
          },
        },
      } = await GET_ONE_RECIPE(recipePk);

      if (access) {
        setRecipe({ title, description, mainText, updateAt, likesCount });
        setCookImages(cookImages);
        if (avatarImage) {
          setOwner({ nickname, avatarImage });
        } else {
          setOwner({ nickname, avatarImage: NO_USER_IMAGE_URL });
        }
        setCategory(values);

        checkOwner(pk);
      }
    } catch (error) {
      console.log(error);
    }
  }, [recipePk, checkOwner]);

  const handleDeleteRecipe = async () => {
    try {
      const {
        data: { access },
      } = await DELETE_RECIPE(recipePk);

      if (access) {
        enqueueSnackbar("?????????????????????", { variant: "info" });
        setTimeout(async () => {
          await router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const needLogin = async () => {
    enqueueSnackbar("????????? ?????? ??????????????? ???????????????", {
      variant: "warning",
    });
    setTimeout(async () => {
      await router.push("/login");
    }, 2000);
  };

  const getLike = useCallback(async () => {
    try {
      const {
        data: { access },
      } = await GET_LIKE(recipePk);
      
      if (access) {
        setLiked(true);
      }
      else {
        setLiked(false);
      }
    } catch (e) {
      console.log(e);
    }
  }, [recipePk]);

  const onClickLike = async () => {
    if (localStorage.getItem("access_token") === null) {
      needLogin();
    }

    const form = { recipePk: recipePk };

    if (liked) {
      try {
        const {
          data: { access },
        } = await DELETE_LIKE(form);

        if (access) {
          setLiked(false);
          getRecipeOne();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const {
          data: { access },
        } = await POST_LIKE(form);

        if (access) {
          setLiked(true);
          getRecipeOne();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getRecipeOne();
    getLike();
    setNavA(slickA.current);
    setNavB(slickB.current);
  }, [getRecipeOne, getLike]);

  return (
    <>
      <Head>
        <title>STARVING | RECIPE</title>
      </Head>
      <Layout>
        <div className="w-full min-h-screen bg-slate-50">
          <section className="w-[1200px] mx-auto flex">
            <article className="w-3/4 min-h-screen bg-white mx-2 my-4 p-8 shadow-sm space-y-4">
              <section className="flex items-center justify-between">
                <p className="text-xl font-bold text-cyan-600">#{category}</p>
                <article className="flex space-x-4 text-neutral-400 text-sm">
                  <section className="flex space-x-1">
                    <article
                      className="flex space-x-1 hover:cursor-pointer group"
                      onClick={onClickLike}
                    >
                      {liked ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-pink-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-pink-300 group-hover:text-pink-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                      <span>Likes</span>
                    </article>
                    <span>{recipe.likesCount}</span>
                  </section>
                  {isOwner ? (
                    <section className="flex">
                      <p
                        className="hover:text-neutral-800 hover:cursor-pointer"
                        onClick={async () => {
                          await router.push(`edit/${recipePk}`);
                        }}
                      >
                        ??????
                      </p>
                      <span className="mx-1 text-sm text-neutral-400">|</span>
                      <p
                        className="hover:text-neutral-800 hover:cursor-pointer"
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
                              <Button
                                color="error"
                                onClick={handleDeleteRecipe}
                              >
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
                        ??????
                      </p>
                    </section>
                  ) : null}
                </article>
              </section>
              <hr />
              <p className="text-3xl font-bold text-center break-all">
                {recipe.title}
              </p>
              <p className="text-lg text-center text-neutral-400 break-all">
                {recipe.description}
              </p>
              <hr />
              <Slider
                ref={slickA}
                asNavFor={navB}
                infinite={true}
                arrows={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
              >
                {cookImages.map((v, i) => (
                  <div key={i} className="relative w-auto h-[500px]">
                    <Image
                      layout="fill"
                      objectFit="contain"
                      src={v}
                      alt="main image"
                    />
                  </div>
                ))}
              </Slider>
              {cookImages.length > 1 && (
                <Slider
                  className="hover:cursor-pointer"
                  ref={slickB}
                  asNavFor={navA}
                  slidesToShow={cookImages.length}
                  swipeToSlide={true}
                  focusOnSelect={true}
                >
                  {cookImages.map((v, i) => (
                    <div key={i} className="relative w-full h-[200px]">
                      <Image
                        layout="fill"
                        objectFit="cover"
                        className="brightness-75"
                        src={v}
                        alt="prev image"
                      />
                    </div>
                  ))}
                </Slider>
              )}
              <p className="text-md leading-8 break-all">{recipe.mainText}</p>
            </article>
            <article className="w-1/4 min-h-screen bg-sky-50 mx-2 my-4 p-4 shadow-sm space-y-4">
              <section className="flex flex-col items-center space-y-4">
                <Image
                  width={100}
                  height={100}
                  objectFit="cover"
                  className="rounded-full"
                  src={owner.avatarImage}
                  alt="avatar image"
                />
                <p className="text-2xl font-bold text-cyan-600">
                  {owner.nickname}
                </p>
                <span className="font-bold text-sm text-neutral-400">
                  {new Date(recipe.updateAt).toLocaleString("ko-KR")}
                </span>
              </section>
              <hr />
              <section>
                <CommentArea recipePk={recipePk} />
              </section>
            </article>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default Detail;
