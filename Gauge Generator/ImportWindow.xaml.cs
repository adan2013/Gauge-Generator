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
using System.Windows.Shapes;
using DataManagementSystem;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for ImportWindow.xaml
    /// </summary>
    public partial class ImportWindow : Window
    {
        public string projectpath = "";
        DMS<ProjectData> source;
        ProjectData proj;

        List<Layer> selecteditems = new List<Layer>();
        List<Layer> rangeitems = new List<Layer>();
        
        public ImportWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            proj = new ProjectData();
            source = new DMS<ProjectData>(Global.DMS_ID, ref proj, projectpath);
            source.FileUpdated += FU;
            if (source.LoadFromSource()) LoadList();
            RefreshPreview(null);
            RefreshInfo();
        }

        private void LoadList()
        {
            lst.Items.Clear();
            foreach (Layer i in proj.layers)
            {
                if (i is Range_Item) continue;
                Border br = new Border
                {
                    Tag = i
                };
                Grid gr = new Grid()
                {
                    Width = 250
                };
                StackPanel spnl = new StackPanel
                {
                    Orientation = Orientation.Horizontal
                };
                TextBlock tblock = new TextBlock
                {
                    VerticalAlignment = VerticalAlignment.Center,
                    Text = i.Label + "\nRange source: " + i.RangeSourceName,
                    FontSize = 12,
                    FontFamily = new FontFamily("Segoe UI"),
                    Width = 200
                };
                Image chkbox = new Image
                {
                    Width = 32,
                    Height = 32,
                    Source = new BitmapImage(new Uri(Global.CheckboxState[selecteditems.Contains(i) ? 1 : 0])),
                    Margin = new Thickness(4, 4, 4, 4),
                    Cursor = Cursors.Hand,
                    Tag = i
                };
                chkbox.MouseDown += Chkbox_MouseDown;
                spnl.Children.Add(tblock);
                gr.ColumnDefinitions.Add(new ColumnDefinition() { Width = new GridLength(200) });
                gr.ColumnDefinitions.Add(new ColumnDefinition() { Width = new GridLength(40) });
                spnl.SetValue(Grid.ColumnProperty, 0);
                chkbox.SetValue(Grid.ColumnProperty, 1);
                gr.Children.Add(spnl);
                gr.Children.Add(chkbox);
                br.MouseEnter += MouseEnterItem;
                br.MouseLeave += MouseLeaveItem;
                br.Child = gr;
                lst.Items.Add(br);
            }
        }

        private void MouseLeaveItem(object sender, MouseEventArgs e)
        {
            RefreshPreview(null);
        }

        private void MouseEnterItem(object sender, MouseEventArgs e)
        {
            RefreshPreview(new List<Layer>() { (Layer)((Border)sender).Tag });
        }

        private void FU(ref ProjectData obj)
        {
            proj = obj;
        }

        private void RefreshPreview(List<Layer> onlythis)
        {
            proj?.DrawProject(ref can, false, 420, true, onlythis);
        }

        private void Chkbox_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                Image s = (Image)sender;
                Layer l = (Layer)s.Tag;
                if(selecteditems.Contains(l))
                {
                    selecteditems.Remove(l);
                    s.Source = new BitmapImage(new Uri(Global.CheckboxState[0]));
                }
                else
                {
                    selecteditems.Add(l);
                    s.Source = new BitmapImage(new Uri(Global.CheckboxState[1]));
                }
                RefreshInfo();
                e.Handled = true;
            }
        }

        private void RefreshInfo()
        {
            ok_btn.IsEnabled = selecteditems.Count > 0;
            rangeitems.Clear();
            foreach(Layer i in selecteditems)
            {
                if (!rangeitems.Contains(i.RangeSource)) rangeitems.Add(i.RangeSource);
            }
            infobox.Text = "Selected layers to import: " + selecteditems.Count + "\nNecessary \"Range\" sources: " + rangeitems.Count;
        }

        private void Ok_btn_Click(object sender, RoutedEventArgs e)
        {
            if(MessageBox.Show("Do you want to import " + (selecteditems.Count + rangeitems.Count) + " layers? Are you sure?", "Import", MessageBoxButton.YesNo, MessageBoxImage.Information, MessageBoxResult.Yes) == MessageBoxResult.Yes)
            {
                for(int i = proj.layers.Count - 1; i >= 0; i--)
                {
                    Layer l = proj.layers[i];
                    if(selecteditems.Contains(l) || rangeitems.Contains(l))
                    {
                        Global.project.layers.Insert(0, l);
                    }
                }
                Global.SetSidebar(Global.SidebarPages.Layers);
                Global.EditingLayer = null;
                Global.dms.CheckChanges();
                DialogResult = true;
            }
        }

        private void Cancel_btn_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }

        private void AllLayers_Click(object sender, RoutedEventArgs e)
        {
            if (selecteditems.Count + rangeitems.Count == proj.layers.Count)
            {
                selecteditems.Clear();
            }
            else
            {
                selecteditems.Clear();
                foreach (Layer i in proj.layers)
                {
                    if (!(i is Range_Item)) selecteditems.Add(i);
                }
            }
            RefreshInfo();
            LoadList();
        }

        private void HoldPreview_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if(e.LeftButton == MouseButtonState.Pressed)
            {
                List<Layer> p = new List<Layer>();
                p.AddRange(selecteditems);
                p.AddRange(rangeitems);
                RefreshPreview(p);
            }
        }

        private void HoldPreview_MouseUp(object sender, MouseButtonEventArgs e)
        {
            RefreshPreview(null);
        }
    }
}
