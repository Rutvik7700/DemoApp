import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import MainPage from "../components/MainPage.jsx";

export default function HomePage() {
  return (
    <Page fullWidth>
      <TitleBar title="App name" primaryAction={null} />
       <MainPage/> 
    </Page>
  );
}
