import { Box, Paper } from '@mui/material';
import PostIntro from './PostIntro';
import PostContent from './PostContent';
import PostMedia from './PostMedia';

export default function PostCard({ loading = false, profileUser = {} }) {

  const mainImage = profileUser?.media[0]?.fileName;

  return (
    <Paper className="post" elevation={1}>
      <Box component="img" src={mainImage} className="postImage" alt="News post" sx={{maxHeight: "75vh", contain: "content"}}/>
      
      <PostIntro loading={loading} profileUser={profileUser} />
      <PostContent loading={loading} profileUser={profileUser} />
      <PostMedia loading={loading} profileUser={profileUser} />
    </Paper>
  );
}