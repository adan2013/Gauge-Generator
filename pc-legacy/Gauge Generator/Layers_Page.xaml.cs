using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for Layers_Page.xaml
    /// </summary>
    public partial class Layers_Page : Page
    {
        bool highlight = false;

        public Layers_Page()
        {
            InitializeComponent();
            Reload_Layers_List(Global.LastEditedLayer);
        }

        private void Reload_Layers_List(int index)
        {
            highlight = false;
            layers_view.Items.Clear();
            foreach(Layer i in Global.project.layers)
            {
                ListBoxItem itm = new ListBoxItem
                {
                    Tag = i
                };
                StackPanel spnl = new StackPanel
                {
                    Orientation = Orientation.Horizontal
                };
                Image img = new Image
                {
                    Width = 40,
                    Height = 40,
                    Source = new BitmapImage(new Uri(Global.LayerSmallImages[(int)Global.GetLayerType(i)])),
                    Margin = new Thickness(3, 3, 10, 3)
                };
                TextBlock tblock = new TextBlock
                {
                    VerticalAlignment = VerticalAlignment.Center,
                    Text = i.Label,
                    FontSize = 16,
                    FontFamily = new FontFamily("Segoe UI"),
                    Width = 220
                };
                Image vsw = new Image
                {
                    Width = 24,
                    Height = 24,
                    Source = new BitmapImage(new Uri(Global.Visibility[i.Visible ? 1 : 0])),
                    Margin = new Thickness(8, 8, 8, 8),
                    Cursor = Cursors.Hand,
                    Tag = i
                };
                itm.MouseMove += ItemMouseMove;
                itm.MouseLeave += ItemMouseLeave;
                vsw.MouseDown += Vsw_MouseDown;
                spnl.Children.Add(img);
                spnl.Children.Add(tblock);
                spnl.Children.Add(vsw);
                itm.Content = spnl;
                layers_view.Items.Add(itm);
            }
            layers_view.SelectedIndex = index;
            Global.RefreshScreen();
        }

        private void ItemMouseLeave(object sender, MouseEventArgs e)
        {
            Global.RefreshScreen();
        }

        private void ItemMouseMove(object sender, MouseEventArgs e)
        {
            if(e.GetPosition((ListBoxItem)sender).X < 43)
            {
                Global.RefreshScreen(new List<Layer>() { (Layer)((ListBoxItem)sender).Tag });
                highlight = true;
            }
            else
            {
                if (highlight) Global.RefreshScreen();
            }
        }

        private void Vsw_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if(e.LeftButton == MouseButtonState.Pressed)
            {
                Image s = (Image)sender;
                Layer l = (Layer)s.Tag;
                l.Visible = !l.Visible;
                s.Source = new BitmapImage(new Uri(Global.Visibility[l.Visible ? 1 : 0]));
                Global.RefreshScreen();
                Global.dms.CheckChanges();
                e.Handled = true;
            }
        }

        private void New_layer_btn(object sender, RoutedEventArgs e)
        {
            if(Global.project.layers.Count < Global.MAX_LAYERS)
            {
                NewItemWindow w = new NewItemWindow
                {
                    Owner = Global.mainwindowobj
                };
                w.ShowDialog();
                if(w.DialogResult.HasValue && w.DialogResult.Value)
                {
                    Global.dms.CheckChanges();
                    Global.EditingLayer = Global.project.layers[0];
                    Global.SetSidebar(Global.SidebarPages.Editor);
                }
                w.Close();
                Global.LastEditedLayer = 0;
            }
            else
            {
                MessageBox.Show("You have reached the maximum number of layers in this project!", "Maximum number of layers", MessageBoxButton.OK, MessageBoxImage.Information, MessageBoxResult.OK);
            }
        }

        private void Delete_layer_btn(object sender, RoutedEventArgs e)
        {
            Layer target = Global.project.layers[layers_view.SelectedIndex];
            bool conflict = false;
            if(Global.GetLayerType(target) == Global.LayersType.Range)
            {
                foreach(Layer i in Global.project.layers)
                {
                    if(i.RangeSource == target)
                    {
                        conflict = true;
                        break;
                    }
                }
                if (conflict) MessageBox.Show("This layer is associated with other objects, so it can not be removed!", "Error", MessageBoxButton.OK, MessageBoxImage.Information, MessageBoxResult.OK);
            }
            if (!conflict && layers_view.SelectedIndex >= 0 && MessageBox.Show("Do you want to delete this object? Are you sure?", "Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) == MessageBoxResult.Yes)
            {
                Global.project.layers.RemoveAt(layers_view.SelectedIndex);
                Reload_Layers_List(-1);
                Global.dms.CheckChanges();
            }
        }

        private void Clone_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex >= 0)
            {
                CloneWindow cw = new CloneWindow
                {
                    Owner = Global.mainwindowobj,
                    LayerIndex = layers_view.SelectedIndex
                };
                cw.ShowDialog();
                if (cw.DialogResult.HasValue && cw.DialogResult.Value)
                {
                    Global.EditingLayer = Global.project.layers[layers_view.SelectedIndex];
                    Global.SetSidebar(Global.SidebarPages.Editor);
                    Global.dms.CheckChanges();
                }
                cw.Close();
            }
        }

        private void Moveup_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex > 0)
            {
                int i = layers_view.SelectedIndex;
                Layer temp = Global.project.layers[i];
                Global.project.layers.RemoveAt(i);
                Global.project.layers.Insert(i - 1, temp);
                Reload_Layers_List(i - 1);
                Global.dms.CheckChanges();
            }
        }

        private void Movedn_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex >= 0 && layers_view.SelectedIndex < layers_view.Items.Count - 1)
            {
                int i = layers_view.SelectedIndex;
                Layer temp = Global.project.layers[i];
                Global.project.layers.RemoveAt(i);
                Global.project.layers.Insert(i + 1, temp);
                Reload_Layers_List(i + 1);
                Global.dms.CheckChanges();
            }
        }

        private void Layers_view_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            bool r = !(layers_view.SelectedIndex < 0);
            del_btn.IsEnabled = r;
            clone_btn.IsEnabled = r;
            up_btn.IsEnabled = r;
            dn_btn.IsEnabled = r;
            Global.LastEditedLayer = layers_view.SelectedIndex;
        }

        private void Layers_view_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton != MouseButtonState.Pressed) return;
            if (layers_view.SelectedIndex >= 0)
            {
                if (e.OriginalSource is Image img && img.Tag is Layer) return;
                Global.EditingLayer = Global.project.layers[layers_view.SelectedIndex];
                Global.SetSidebar(Global.SidebarPages.Editor);
            }
        }

        private void Open_proj_settings(object sender, RoutedEventArgs e)
        {
            Global.SetSidebar(Global.SidebarPages.ProjectSettings);
        }
    }
}
