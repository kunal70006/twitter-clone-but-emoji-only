import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

import LoadingSpinner, { LoadingPage } from "~/components/Loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/Layout";
import PostView from "~/components/PostView";

const CreatePostWizard = () => {
  const ctx = api.useContext();
  const { user } = useUser();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
      setInput("");
    },
  });

  const [input, setInput] = useState("");

  if (!user) return null;

  return (
    <div className="flex w-full items-center gap-4">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        width={50}
        height={50}
        className="rounded-full"
      />
      <input
        type="text"
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && <LoadingSpinner />}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();
  // start fetching asap
  api.posts.getAll.useQuery();

  if (!user.isLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Emoji Only Twitter</title>
        <meta name="description" content="😜" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="flex flex-col justify-start border-b border-slate-600 p-4">
          {!user.isSignedIn ? (
            <div className="w-fit justify-start">
              <SignInButton />
            </div>
          ) : (
            <CreatePostWizard />
          )}

          <Feed />
        </div>
      </PageLayout>
    </>
  );
};

export default Home;
