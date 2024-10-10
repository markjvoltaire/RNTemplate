import { supabase } from "./supabase";

export async function getFriends() {
  const userId = supabase.auth.currentUser.id;
  const { body: friends1 } = await supabase
    .from("friendRequests")
    .select("receiverId, senderId")
    .eq("status", "friends")
    .eq("receiverId", userId);

  const { body: friends2 } = await supabase
    .from("friendRequests")
    .select("receiverId, senderId")
    .eq("status", "friends")
    .eq("senderId", userId);

  const { body: subscriber } = await supabase
    .from("subscriptions")
    .select("creatorId")
    .eq("userId", userId);

  const postList = friends1.concat(friends2, subscriber);

  const filteredValues = postList
    .map((item) => {
      const filteredItem = {};
      for (const key in item) {
        if (item[key] !== userId) {
          filteredItem[key] = item[key];
        }
      }
      return filteredItem;
    })
    .map((obj) => Object.values(obj)[0]);

  // Push userId to filteredValues array
  filteredValues.push(userId);

  return filteredValues;
}

export async function getUnlockedUserPost(friendList) {
  const userId = supabase.auth.currentUser.id;
  const resp = await supabase
    .from("post")
    .select("*")
    .in("user_id", [friendList, userId])
    .order("date", { ascending: false });

  return resp.body;
}

export async function getUser(post) {
  const resp = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", post.user_id)
    .single()
    .limit(1);

  return resp;
}

export async function getPosts(userid) {
  let { data: post, error } = await supabase
    .from("post")
    .select("*")
    .eq("user_id", userid)
    .eq("mediaType", "image")
    .order("id", { ascending: false });

  return post;
}

export async function getNoti(token) {
  const userId = supabase.auth.currentUser.id;

  const res = await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("user_id", userId);

  return res;
}

export async function getFriendStatus(userDetails) {
  const userId = supabase.auth.currentUser.id;
  const userSentRequest = await supabase
    .from("friendRequests")
    .select("status")
    .eq("senderId", userId)
    .eq("receiverId", route.params.post.user_id);

  const userReceivedRequest = await supabase
    .from("friendRequests")
    .select("status")
    .eq("senderId", route.params.post.user_id)
    .eq("receiverId", userId);

  if (userSentRequest.body.length === 1) {
    if (userSentRequest.body[0].status === "friends") {
      return "friends";
    } else if (userSentRequest.body[0].status === "pending") {
      return "pending";
    }
  }

  if (userReceivedRequest.body.length === 1) {
    if (userReceivedRequest.body[0].status === "friends") {
      return "friends";
    } else if (userReceivedRequest.body[0].status === "pending") {
      return "awaitingResponse";
    }
  }

  if (
    userReceivedRequest.body.length === 0 &&
    userSentRequest.body.length === 0
  ) {
    return "notFriends";
  }
}

export async function getRandomUser() {
  const response = await supabase
    .from("profiles")
    .select("*")
    .eq("type", "business")
    .neq(
      "bannerImage",
      "https://ivxipgaauikqwyguqagw.supabase.co/storage/v1/object/public/profile-images/noProfileAVI.jpeg"
    );

  const users = response.data;

  // Fisher-Yates shuffle algorithm to randomize the array
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }

  // Limit to the first 10 users (or adjust the limit as needed)
  const randomUsers = users.slice(0, 10);

  return randomUsers;
}

export async function uploadStatus(description) {
  console.log("description", description);
  const userId = supabase.auth.currentUser.id;
  try {
    const newStatus = {
      user_id: userId,
      description: description, // Use the current value of the description state
      media: null,
      mediaType: "status",
    };
    const resp = await supabase.from("post").insert([newStatus]);
    console.log("resp", resp);
    return resp;
  } catch (error) {
    console.error("Error submitting comment:", error);
    throw error;
  }
}

export async function deletePost(post) {
  const userId = supabase.auth.currentUser.id;
  const resp = await supabase
    .from("post")
    .delete()
    .eq("user_id", userId)
    .eq("id", post.id);
  console.log("res", res);

  const res = await supabase
    .from("notifications")
    .delete()
    .eq("postId", post.id);

  return resp && res;
}

export async function reportPostById(post) {
  const userId = supabase.auth.currentUser.id;
  const resp = await supabase.from("reports").insert([
    {
      postId: post.id,
      creatorId: post.user_id,
      userId: userId.userId,
      commentId: "THIS IS A POST REPORT",
      comment: "THIS IS A POST REPORT",
    },
  ]);

  console.log("resp", resp);
  return resp;
}

export async function getNotifications() {
  const userId = supabase.auth.currentUser.id;

  // Fetch likes and comments
  const { body: likesAndComments } = await supabase
    .from("notifications")
    .select("*")
    .eq("creatorId", userId)
    .neq("userId", userId);

  // Fetch friend requests
  const { body: friendRequests } = await supabase
    .from("friendRequests")
    .select("*")
    .eq("receiverId", userId)
    .eq("status", "pending");

  // Combine likesAndComments and friendRequests arrays
  const list = likesAndComments.concat(friendRequests);

  // Sort the combined array by the 'created_at' property in descending order
  const newList = list.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return newList;
}

export async function getReactionList(post) {
  const userId = supabase.auth.currentUser.id;

  const { body: resp } = await supabase
    .from("notifications")
    .select("*")
    .eq("postId", post.id)
    .eq("eventType", "reaction");

  return resp;
}

export async function getPost(post) {
  const resp = await supabase
    .from("post")
    .select("*")
    .eq("id", post.postId)
    .single()
    .limit(1);

  return resp;
}

export async function getComments(post) {
  const resp = await supabase
    .from("notifications")
    .select("*")
    .eq("postId", post.id)
    .eq("eventType", "comment");

  return resp;
}

export async function reportCommentById(post) {
  const resp = await supabase.from("reports").insert([
    {
      postId: post.postId,
      creatorId: post.creatorId,
      userId: post.userId,
      commentId: post.commentId,
      comment: post.comment,
    },
  ]);
  return resp;
}

export async function deleteComment(post) {
  const userId = supabase.auth.currentUser.id;
  const resp = await supabase
    .from("notifications")
    .delete()
    .eq("eventType", "comment")
    .eq("userId", userId)
    .eq("commentId", post.commentId);

  return resp;
}
