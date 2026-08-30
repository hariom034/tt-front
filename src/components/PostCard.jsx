import { Box, Paper } from '@mui/material';
import PostIntro from './PostIntro';
import PostContent from './PostContent';

export default function PostCard({ loading = false, profileUser = {} }) {

  return (
    <Paper className="post" elevation={1}>
      <Box component="img" src="/post-placeholder.jpg" className="postImage" alt="News post" sx={{maxHeight: "75vh", contain: "content"}}/>
      
      <PostIntro loading={loading} profileUser={profileUser} />
      <PostContent loading={loading} profileUser={profileUser} />
    </Paper>
  );
}