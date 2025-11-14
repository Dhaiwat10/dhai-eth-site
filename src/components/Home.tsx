import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blog-posts";
import { LetterboxdRecent } from "./LetterboxdRecent";
import { GitHubStats } from "./GitHubStats";
import TravelMap from "./TravelMap";

function Home() {
  const motorsportsVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = motorsportsVideoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay might be blocked; user can start playback manually.
      });
    }
  }, []);

  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div>
      <section className="mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">dhai.eth</h1>
        <h2 className="text-3xl text-gray-300 mb-6">Dhaiwat Pandya</h2>
        <p className="text-xl text-gray-400 max-w-2xl">
          Ethereum Developer. Relentlessly Curious.
        </p>

        <div className="flex flex-row gap-4 mt-4">
          <Link
            to="https://x.com/dhaiwat10"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
            target="_blank"
          >
            Twitter
          </Link>
          <Link
            to="https://github.com/dhaiwat10"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
          >
            GitHub
          </Link>
          <Link
            to="https://hackmd.io/@dhaiwat10/ByA1tWTgee"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
          >
            CV
          </Link>
          <Link
            to="https://farcaster.xyz/dhai.eth"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
          >
            Farcaster
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Latest Posts</h3>
          <Link
            to="/blog"
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
            >
              <Link to={`/blog/${post.id}`}>
                <h4 className="text-xl font-bold text-white mb-2 hover:text-gray-300 transition-colors">
                  {post.title}
                </h4>
              </Link>

              <time dateTime={post.date} className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              <p className="text-gray-400 mt-3 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <Link
                to={`/blog/${post.id}`}
                className="text-gray-400 hover:text-white font-medium text-sm transition-colors inline-flex items-center"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">GitHub Activity</h3>
            <Link
              to="https://github.com/dhaiwat10"
              className="text-gray-400 hover:text-white font-medium transition-colors"
              target="_blank"
            >
              View profile →
            </Link>
          </div>
          <p className="text-gray-400 max-w-2xl">
            I am always experimenting with problems I find interesting. I post a lot of these experiments on my GitHub.
          </p>
        </div>

        <GitHubStats username="dhaiwat10" />
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">Motorsports</h3>
          </div>
          <p className="text-gray-400 max-w-2xl mb-4">
            Racetracks and racecars. There's nowhere I feel more free.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-black aspect-video">
          <video
            ref={motorsportsVideoRef}
            className="w-full h-full object-cover"
            src="/vroom.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">Recent Films</h3>
            <Link
              to="https://letterboxd.com/dhaiwat10"
              className="text-gray-400 hover:text-white font-medium transition-colors"
              target="_blank"
            >
              View all →
            </Link>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Movies are my favourite art form. Here are a few that I watched the most recently from my Letterboxd profile.
          </p>
        </div>

        <LetterboxdRecent username="Dhaiwat" limit={6} />
      </section>

      <section id="travels" className="mt-16">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-3">Travels</h3>
          <p className="text-gray-400 max-w-2xl">
            Ever since I was a kid, I was fascinated with maps and travel. These are some of the places I've been fortunate enough to visit.
          </p>
        </div>

        <TravelMap />
      </section>
    </div>
  );
}

export default Home;