import React, { useContext } from 'react';
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiThumbUp } from '@mdi/js';
import { AuthContext } from '../helpers/AuthContext';

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {

    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios.get("https://newstacktutorial-4355c8849eb1.herokuapp.com/posts", { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
        setListOfPosts(response.data.listOfPosts);
        setLikedPosts(response.data.likedPosts.map((like) => {
          return like.PostId;
        }));
      });
    }


  }, [])

  const likeAPost = (postId) => {
    axios.post("https://newstacktutorial-4355c8849eb1.herokuapp.com/likes",
      { PostId: postId },
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
      .then((response) => {
        setListOfPosts(
          // @ts-ignore
          listOfPosts.map((post) => {
            if (post.id === postId) {
              if (response.data.liked) {
                return { ...post, Likes: [...post.Likes, 0] };
              } else {
                const likesArray = post.Likes;
                likesArray.pop();
                return { ...post, Likes: likesArray }
              }
            } else {
              return post;
            }
          })
        )

        if (likedPosts.includes(postId)) {
          setLikedPosts(likedPosts.filter((id) => { return id !== postId; }))
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
      });
  }

  return (
    <div>
      {listOfPosts.map((value, key) => {
        return (
          <div key="key" className="post" >
            <div className="title"> {value.title} </div>
            <div className="body" onClick={() => { navigate(`/post/${value.id}`) }}> {value.postText} </div>
            <div className="footer">

              <div className="username"><Link to={`/profile/${value.UserId}`}>{value.username}</Link></div>
              <div className="buttons">
                <div onClick={() => { likeAPost(value.id) }}>
                  <Icon path={mdiThumbUp} size={1} className={likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"} />
                </div>

                <label> {value.Likes.length}</label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default Home
